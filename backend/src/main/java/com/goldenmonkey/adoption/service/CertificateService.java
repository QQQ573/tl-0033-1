package com.goldenmonkey.adoption.service;

import com.goldenmonkey.adoption.entity.AdoptionOrder;
import com.goldenmonkey.adoption.entity.AdoptionTier;
import com.goldenmonkey.adoption.entity.Certificate;
import com.goldenmonkey.adoption.entity.Monkey;
import com.goldenmonkey.adoption.repository.CertificateRepository;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.graphics.image.LosslessFactory;
import org.apache.pdfbox.pdmodel.graphics.image.PDImageXObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.Color;
import java.awt.Font;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Optional;
import java.util.UUID;

@Service
public class CertificateService {

    @Autowired
    private CertificateRepository certificateRepository;

    public Optional<Certificate> getCertificateByOrderId(Long orderId) {
        return certificateRepository.findByOrderId(orderId);
    }

    public Optional<Certificate> getCertificateByNo(String certificateNo) {
        return certificateRepository.findByCertificateNo(certificateNo);
    }

    public Optional<byte[]> getCertificatePdf(String certificateNo) {
        return certificateRepository.findByCertificateNo(certificateNo)
                .map(Certificate::getPdfContent);
    }

    public Certificate generateCertificate(AdoptionOrder order, Monkey monkey, AdoptionTier tier) {
        Certificate certificate = new Certificate();
        certificate.setOrderId(order.getId());
        certificate.setCertificateNo(generateCertificateNo());

        String displayName = maskName(order.getAdopterName());
        certificate.setAdopterDisplayName(displayName);
        certificate.setMonkeyName(monkey.getName());
        certificate.setTierName(tier.getName());

        LocalDate startDate = LocalDate.now();
        certificate.setStartDate(startDate);
        certificate.setEndDate(startDate.plusMonths(tier.getDurationMonths()));
        certificate.setIssuedAt(LocalDateTime.now());

        byte[] pdfContent = generatePdf(certificate, monkey, tier, order);
        certificate.setPdfContent(pdfContent);

        return certificateRepository.save(certificate);
    }

    private byte[] generatePdf(Certificate certificate, Monkey monkey, AdoptionTier tier, AdoptionOrder order) {
        final int W = 1600;
        final int H = 1131;
        BufferedImage image = new BufferedImage(W, H, BufferedImage.TYPE_INT_RGB);
        Graphics2D g2d = image.createGraphics();
        g2d.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        g2d.setRenderingHint(RenderingHints.KEY_TEXT_ANTIALIASING, RenderingHints.VALUE_TEXT_ANTIALIAS_ON);
        g2d.setRenderingHint(RenderingHints.KEY_FRACTIONALMETRICS, RenderingHints.VALUE_FRACTIONALMETRICS_ON);

        g2d.setColor(new Color(0xFFFBF5));
        g2d.fillRect(0, 0, W, H);

        g2d.setColor(new Color(0x2D6A4F));
        g2d.setStroke(new BasicStroke(8));
        g2d.drawRect(20, 20, W - 40, H - 40);
        g2d.setColor(new Color(0x52B788));
        g2d.setStroke(new BasicStroke(3));
        g2d.drawRect(40, 40, W - 80, H - 80);

        int x, y;

        g2d.setColor(new Color(0x2D6A4F));
        Font titleFont = findChineseFont(Font.BOLD, 64);
        g2d.setFont(titleFont);
        String title = "川金丝猴认养证书";
        FontMetrics fm = g2d.getFontMetrics();
        x = (W - fm.stringWidth(title)) / 2;
        y = 200;
        g2d.drawString(title, x, y);

        Font subFont = findChineseFont(Font.PLAIN, 20);
        g2d.setFont(subFont);
        g2d.setColor(new Color(0x666666));
        fm = g2d.getFontMetrics();
        String certNo = "证书编号：" + certificate.getCertificateNo();
        g2d.drawString(certNo, W - 80 - fm.stringWidth(certNo), 280);

        String[][] rows = {
                {"认养人", certificate.getAdopterDisplayName()},
                {"认养金丝猴", monkey.getName() + "（编号：" + monkey.getCode() + "）"},
                {"认养档位", tier.getName()},
                {"认养金额", "¥" + tier.getPrice() + " 元（" + tier.getDurationMonths() + "个月）"},
                {"认养期限", certificate.getStartDate().format(DateTimeFormatter.ofPattern("yyyy年MM月dd日"))
                        + "  至  " + certificate.getEndDate().format(DateTimeFormatter.ofPattern("yyyy年MM月dd日"))},
                {"颁发日期", certificate.getIssuedAt().format(DateTimeFormatter.ofPattern("yyyy年MM月dd日"))}
        };

        Font labelFont = findChineseFont(Font.BOLD, 28);
        Font valueFont = findChineseFont(Font.PLAIN, 28);
        int tableX = 200;
        int tableY = 380;
        int rowH = 90;
        int labelW = 340;
        int valueW = 860;

        for (int i = 0; i < rows.length; i++) {
            int ry = tableY + i * rowH;

            g2d.setColor(new Color(0xF5F5F5));
            g2d.fillRect(tableX, ry, labelW, rowH - 2);
            g2d.setColor(new Color(0x2D6A4F));
            g2d.setFont(labelFont);
            fm = g2d.getFontMetrics();
            int ly = ry + (rowH - fm.getHeight()) / 2 + fm.getAscent();
            g2d.drawString(rows[i][0], tableX + 30, ly);

            g2d.setColor(Color.WHITE);
            g2d.fillRect(tableX + labelW, ry, valueW, rowH - 2);
            g2d.setColor(new Color(0x333333));
            g2d.setFont(valueFont);
            fm = g2d.getFontMetrics();
            ly = ry + (rowH - fm.getHeight()) / 2 + fm.getAscent();
            g2d.drawString(rows[i][1], tableX + labelW + 30, ly);

            g2d.setColor(new Color(0xCCCCCC));
            g2d.setStroke(new BasicStroke(1));
            g2d.drawRect(tableX, ry, labelW + valueW, rowH - 2);
        }

        if (order.getMessage() != null && !order.getMessage().trim().isEmpty()) {
            int my = tableY + rows.length * rowH + 50;
            g2d.setColor(new Color(0xF5F5F5));
            g2d.fillRect(tableX, my, labelW, 70);
            g2d.setColor(new Color(0x2D6A4F));
            g2d.setFont(labelFont);
            fm = g2d.getFontMetrics();
            g2d.drawString("认养寄语", tableX + 30, my + 45);

            g2d.setColor(Color.WHITE);
            g2d.fillRect(tableX + labelW, my, valueW, 70);
            g2d.setColor(new Color(0x333333));
            g2d.setFont(valueFont);
            String msg = order.getMessage().trim();
            if (msg.length() > 32) msg = msg.substring(0, 32) + "…";
            g2d.drawString(msg, tableX + labelW + 30, my + 45);

            g2d.setColor(new Color(0xCCCCCC));
            g2d.drawRect(tableX, my, labelW + valueW, 70);
        }

        Font thanksFont = findChineseFont(Font.PLAIN, 26);
        g2d.setFont(thanksFont);
        g2d.setColor(new Color(0x2D6A4F));
        String line1 = "感谢您对川金丝猴保护事业的支持与贡献！";
        String line2 = "您的爱心将帮助这些可爱的精灵在自然家园中健康成长。";
        fm = g2d.getFontMetrics();
        int baseY = 1000;
        g2d.drawString(line1, (W - fm.stringWidth(line1)) / 2, baseY);
        g2d.drawString(line2, (W - fm.stringWidth(line2)) / 2, baseY + 45);

        Font orgFont = findChineseFont(Font.PLAIN, 24);
        g2d.setFont(orgFont);
        g2d.setColor(new Color(0x333333));
        fm = g2d.getFontMetrics();
        String org = "川金丝猴保护研究中心";
        String date = certificate.getIssuedAt().format(DateTimeFormatter.ofPattern("yyyy年MM月dd日"));
        int rx = W - 80 - fm.stringWidth(org);
        g2d.drawString(org, rx, 1090);
        rx = W - 80 - fm.stringWidth(date);
        g2d.drawString(date, rx, 1125);

        g2d.setColor(new Color(0xEE5A6F));
        int cx = W - 220;
        int cy = 1095;
        g2d.setStroke(new BasicStroke(4));
        g2d.drawOval(cx - 55, cy - 75, 110, 110);
        Font sealFont = findChineseFont(Font.BOLD, 22);
        g2d.setFont(sealFont);
        fm = g2d.getFontMetrics();
        String seal = "公益";
        g2d.drawString(seal, cx - fm.stringWidth(seal) / 2, cy + 8);

        g2d.dispose();

        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            PDDocument doc = new PDDocument();
            float dpi = 220f;
            float scale = 72f / dpi;
            float pdfW = W * scale;
            float pdfH = H * scale;
            PDRectangle pageSize = new PDRectangle(pdfW, pdfH);
            PDPage page = new PDPage(pageSize);
            doc.addPage(page);

            PDImageXObject pdImage = LosslessFactory.createFromImage(doc, image);
            try (PDPageContentStream cs = new PDPageContentStream(doc, page)) {
                cs.drawImage(pdImage, 0, 0, pdfW, pdfH);
            }

            doc.save(baos);
            doc.close();
            return baos.toByteArray();
        } catch (Exception e) {
            System.err.println("PDF生成详细错误:");
            e.printStackTrace();
            throw new RuntimeException("生成证书PDF失败: " + e.getMessage(), e);
        }
    }

    private Font findChineseFont(int style, int size) {
        String[] candidates = {
                Font.DIALOG, Font.SANS_SERIF, Font.SERIF,
                "PingFang SC", "Microsoft YaHei", "微软雅黑",
                "Noto Sans CJK SC", "Source Han Sans SC", "Source Han Sans CN",
                "WenQuanYi Micro Hei", "WenQuanYi Zen Hei",
                "SimHei", "黑体", "SimSun", "宋体",
                "Heiti SC", "STHeiti", "STSong",
                "Arial Unicode MS", "DejaVu Sans"
        };
        for (String name : candidates) {
            Font f = new Font(name, style, size);
            if (f.canDisplay('川') && f.canDisplay('金') && f.canDisplay('猴')
                    && f.canDisplay('认') && f.canDisplay('养')) {
                return f;
            }
        }
        Font last = new Font(Font.SANS_SERIF, style, size);
        if (last.canDisplayUpTo("川金丝猴认养") == -1) return last;
        return last;
    }

    private String generateCertificateNo() {
        String dateStr = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String uuid = UUID.randomUUID().toString().replace("-", "").substring(0, 12).toUpperCase();
        return "CERT" + dateStr + uuid;
    }

    private String maskName(String name) {
        if (name == null || name.isEmpty()) return "爱心人士";
        if (name.length() <= 1) return name + "*";
        if (name.length() == 2) return name.charAt(0) + "*";
        StringBuilder sb = new StringBuilder();
        sb.append(name.charAt(0));
        for (int i = 1; i < name.length() - 1; i++) sb.append("*");
        sb.append(name.charAt(name.length() - 1));
        return sb.toString();
    }
}

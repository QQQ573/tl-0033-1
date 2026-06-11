package com.goldenmonkey.adoption.service;

import com.goldenmonkey.adoption.entity.AdoptionOrder;
import com.goldenmonkey.adoption.entity.AdoptionTier;
import com.goldenmonkey.adoption.entity.Certificate;
import com.goldenmonkey.adoption.entity.Monkey;
import com.goldenmonkey.adoption.repository.CertificateRepository;
import com.itextpdf.io.font.PdfEncodings;
import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.font.PdfFont;
import com.itextpdf.kernel.font.PdfFontFactory;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.*;
import com.itextpdf.layout.properties.HorizontalAlignment;
import com.itextpdf.layout.properties.TextAlignment;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

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
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdf = new PdfDocument(writer);
            Document document = new Document(pdf);

            PdfFont font = PdfFontFactory.createFont("STSong-Light", "UniGB-UCS2-H", PdfEncodings.IDENTITY_H);

            Paragraph title = new Paragraph("川金丝猴认养证书")
                    .setFont(font)
                    .setFontSize(28)
                    .setBold()
                    .setTextAlignment(TextAlignment.CENTER)
                    .setMarginBottom(20);
            document.add(title);

            Paragraph certNo = new Paragraph("证书编号：" + certificate.getCertificateNo())
                    .setFont(font)
                    .setFontSize(10)
                    .setTextAlignment(TextAlignment.RIGHT)
                    .setMarginBottom(30);
            document.add(certNo);

            Table infoTable = new Table(2);
            infoTable.setWidth(500);
            infoTable.setHorizontalAlignment(HorizontalAlignment.CENTER);

            addInfoRow(infoTable, font, "认养人", certificate.getAdopterDisplayName());
            addInfoRow(infoTable, font, "认养金丝猴", monkey.getName() + "（编号：" + monkey.getCode() + "）");
            addInfoRow(infoTable, font, "认养档位", tier.getName());
            addInfoRow(infoTable, font, "认养金额", "¥" + tier.getPrice() + "元（" + tier.getDurationMonths() + "个月）");
            addInfoRow(infoTable, font, "认养期限", certificate.getStartDate().format(DateTimeFormatter.ofPattern("yyyy年MM月dd日"))
                    + " 至 " + certificate.getEndDate().format(DateTimeFormatter.ofPattern("yyyy年MM月dd日")));
            addInfoRow(infoTable, font, "颁发日期", certificate.getIssuedAt().format(DateTimeFormatter.ofPattern("yyyy年MM月dd日")));

            if (order.getMessage() != null && !order.getMessage().isEmpty()) {
                addInfoRow(infoTable, font, "认养寄语", order.getMessage());
            }

            document.add(infoTable);

            Paragraph thankYou = new Paragraph("\n\n感谢您对川金丝猴保护事业的支持与贡献！\n您的爱心将帮助这些可爱的精灵在自然家园中健康成长。")
                    .setFont(font)
                    .setFontSize(12)
                    .setTextAlignment(TextAlignment.CENTER)
                    .setMarginTop(30);
            document.add(thankYou);

            Paragraph org = new Paragraph("\n\n川金丝猴保护研究中心")
                    .setFont(font)
                    .setFontSize(12)
                    .setTextAlignment(TextAlignment.RIGHT)
                    .setMarginTop(40);
            document.add(org);

            Paragraph date = new Paragraph(certificate.getIssuedAt().format(DateTimeFormatter.ofPattern("yyyy年MM月dd日")))
                    .setFont(font)
                    .setFontSize(12)
                    .setTextAlignment(TextAlignment.RIGHT);
            document.add(date);

            document.close();
            return baos.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("生成证书PDF失败", e);
        }
    }

    private void addInfoRow(Table table, PdfFont font, String label, String value) {
        Cell labelCell = new Cell();
        labelCell.add(new Paragraph(label).setFont(font).setFontSize(12).setBold());
        labelCell.setBackgroundColor(new com.itextpdf.kernel.colors.DeviceRgb(245, 245, 245));
        labelCell.setPadding(8);
        table.addCell(labelCell);

        Cell valueCell = new Cell();
        valueCell.add(new Paragraph(value != null ? value : "").setFont(font).setFontSize(12));
        valueCell.setPadding(8);
        table.addCell(valueCell);
    }

    private String generateCertificateNo() {
        String dateStr = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String uuid = UUID.randomUUID().toString().replace("-", "").substring(0, 12).toUpperCase();
        return "CERT" + dateStr + uuid;
    }

    private String maskName(String name) {
        if (name == null || name.isEmpty()) {
            return "爱心人士";
        }
        if (name.length() <= 1) {
            return name + "*";
        }
        if (name.length() == 2) {
            return name.charAt(0) + "*";
        }
        StringBuilder sb = new StringBuilder();
        sb.append(name.charAt(0));
        for (int i = 1; i < name.length() - 1; i++) {
            sb.append("*");
        }
        sb.append(name.charAt(name.length() - 1));
        return sb.toString();
    }
}

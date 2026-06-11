package com.goldenmonkey.adoption.controller;

import com.goldenmonkey.adoption.common.Result;
import com.goldenmonkey.adoption.entity.Certificate;
import com.goldenmonkey.adoption.service.CertificateService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/certificates")
public class CertificateController {

    @Autowired
    private CertificateService certificateService;

    @GetMapping("/{certificateNo}")
    public Result<Certificate> getByCertificateNo(@PathVariable String certificateNo) {
        return certificateService.getCertificateByNo(certificateNo)
                .map(cert -> {
                    cert.setPdfContent(null);
                    return Result.success(cert);
                })
                .orElse(Result.notFound("证书不存在"));
    }

    @GetMapping("/{certificateNo}/download")
    public ResponseEntity<byte[]> download(@PathVariable String certificateNo) {
        return certificateService.getCertificatePdf(certificateNo)
                .map(pdf -> {
                    HttpHeaders headers = new HttpHeaders();
                    headers.setContentType(MediaType.APPLICATION_PDF);
                    headers.setContentDispositionFormData("attachment", certificateNo + ".pdf");
                    headers.setContentLength(pdf.length);
                    return ResponseEntity.ok()
                            .headers(headers)
                            .body(pdf);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{certificateNo}/view")
    public ResponseEntity<byte[]> view(@PathVariable String certificateNo) {
        return certificateService.getCertificatePdf(certificateNo)
                .map(pdf -> {
                    HttpHeaders headers = new HttpHeaders();
                    headers.setContentType(MediaType.APPLICATION_PDF);
                    headers.setContentLength(pdf.length);
                    return ResponseEntity.ok()
                            .headers(headers)
                            .body(pdf);
                })
                .orElse(ResponseEntity.notFound().build());
    }
}

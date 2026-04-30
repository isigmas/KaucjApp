package pl.isigmas.kaucjapp.notification.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;
import pl.isigmas.kaucjapp.notification.util.TemplateType;

@Service
@RequiredArgsConstructor
public class MailService {

    @Value("${app.base-url}")
    private String baseUrl;

    @Value("${app.mail.from}")
    private String mailFrom;

    private final JavaMailSender javaMailSender;
    private final TemplateEngine templateEngine;

    public void sendMail(String subject, String username,String email, String message, TemplateType templateType) {
        try {
            MimeMessage mimeMessage = javaMailSender.createMimeMessage();

            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            Context context = new Context();
            context.setVariable("baseUrl", baseUrl);
            context.setVariable("name", username);
            context.setVariable("token", message);

            String htmlContent = templateEngine.process(templateType.getTemplateName(), context);

            helper.setFrom(mailFrom);
            helper.setTo(email);
            helper.setSubject(subject);

            helper.setText(htmlContent, true);

            javaMailSender.send(mimeMessage);

        } catch (MessagingException e) {
            throw new RuntimeException("Error while sending email to: " + email, e);
        }
    }
}

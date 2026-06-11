package com.backend_semi.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    // 임시 방편으로 만들어 놓은 설정
    // CorsConfig.java에 다시 설정해놓음
    /*@Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("http://localhost:5173", "http://localhost:9000")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH")
                .allowCredentials(true) ;
    }*/

    @Value("${uploadPath}")
    private String uploadPath ;

    @Value("${file.upload-dir}")
    private String fileUploadDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry
                .addResourceHandler("/images/**")
                .addResourceLocations(uploadPath);

        // 업로드 파일 서빙 (로컬 모드용)
        // 윈도우: C:/upload/files → file:///C:/upload/files/
        registry
                .addResourceHandler("/files/**")
                .addResourceLocations("file:///" + fileUploadDir + "/");

    }
}
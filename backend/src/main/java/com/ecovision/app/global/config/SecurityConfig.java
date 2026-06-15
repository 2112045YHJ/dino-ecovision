package com.ecovision.app.global.config;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.ecovision.app.global.security.JwtAccessDeniedHandler;
import com.ecovision.app.global.security.JwtAuthenticationEntryPoint;
import com.ecovision.app.global.security.JwtAuthenticationFilter;

import lombok.RequiredArgsConstructor;

//	Spring Security 설정 (Stateless + JWT)
//	- 세션 미사용, CSRF 비활성(JWT/REST)
//	- 공개 경로: 회원가입·로그인·토큰 재발급, 던전 상태 조회, 어드민 업로드. 그 외 전부 인증 필요
//	- 필터 단계 인증/인가 실패는 EntryPoint(401)/AccessDeniedHandler(403)로 공통 포맷 응답
//	- CORS: 쿠키(Refresh Token) 전송을 위해 allowCredentials=true + 구체적 Origin 지정

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

	private final JwtAuthenticationFilter jwtAuthenticationFilter;
	private final JwtAuthenticationEntryPoint authenticationEntryPoint;
	private final JwtAccessDeniedHandler accessDeniedHandler;

	@Bean
	public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
		http
			.csrf(csrf -> csrf.disable())
			.cors(Customizer.withDefaults())
			.sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
			.authorizeHttpRequests(auth -> auth
					.requestMatchers("/api/auth/**", "/api/dungeons/active", "/api/admin/**", "/api/regions").permitAll()
					.requestMatchers(org.springframework.http.HttpMethod.GET, "/api/posts/**").permitAll()
					.requestMatchers(org.springframework.http.HttpMethod.GET, "/api/charts/snapshot/**").permitAll()
					.anyRequest().authenticated())
			.exceptionHandling(e -> e
					.authenticationEntryPoint(authenticationEntryPoint)
					.accessDeniedHandler(accessDeniedHandler))
			.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

		return http.build();
	}

	@Bean
	public PasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder();
	}

	@Bean
	public CorsConfigurationSource corsConfigurationSource() {
		CorsConfiguration config = new CorsConfiguration();
		config.setAllowedOrigins(List.of("http://localhost:5173")); // 프론트엔드 Origin
		config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
		config.setAllowedHeaders(List.of("*"));
		config.setAllowCredentials(true); // Refresh Token 쿠키 송수신에 필요

		UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
		source.registerCorsConfiguration("/**", config);
		return source;
	}
}

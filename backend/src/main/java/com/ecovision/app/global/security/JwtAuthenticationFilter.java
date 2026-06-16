package com.ecovision.app.global.security;

import java.io.IOException;
import java.util.List;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

//	요청마다 Authorization: Bearer {accessToken} 헤더를 파싱해 SecurityContext에 인증 정보를 채운다.
//	- 토큰이 없거나 유효하지 않으면 인증 없이 통과시키고(=익명), 보호 자원 접근 시
//	  SecurityConfig의 EntryPoint가 401을 응답한다.
//	- DB 조회 없이 claims만으로 인증을 구성한다(principal = userId).

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

	private static final String HEADER = "Authorization";
	private static final String PREFIX = "Bearer ";

	private final JwtTokenProvider tokenProvider;

	@Override
	protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
			throws ServletException, IOException {

		String token = resolveToken(request);
		if (token != null && tokenProvider.isValid(token, true)) {
			Claims claims = tokenProvider.parseClaims(token);
			Long userId = tokenProvider.getUserId(claims);
			String role = tokenProvider.getRole(claims);

			var authorities = List.of(new SimpleGrantedAuthority("ROLE_" + role));
			var authentication = new UsernamePasswordAuthenticationToken(userId, null, authorities);
			SecurityContextHolder.getContext().setAuthentication(authentication);
		}

		filterChain.doFilter(request, response);
	}

	private String resolveToken(HttpServletRequest request) {
		String header = request.getHeader(HEADER);
		if (header != null && header.startsWith(PREFIX)) {
			return header.substring(PREFIX.length());
		}
		return null;
	}
}

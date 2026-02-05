package com.medivault.entites;

import com.medivault.enums.Role;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "users", uniqueConstraints = {
		@UniqueConstraint(name = "uk_users_username", columnNames = "username"),
		@UniqueConstraint(name = "uk_users_email", columnNames = "email")
})

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor

public class User {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "user_id")
	private Long id;
	
	@Column(nullable = false, length = 150)
	private String username;
	
	@Column(nullable = false, length = 150)
	private String email;
	
	@Column(nullable = false)
	private String passwordHash;
	
	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 10)
	private Role role;

}

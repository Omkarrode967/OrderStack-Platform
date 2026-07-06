package com.Omkar.SpringEcom.repo;

import com.Omkar.SpringEcom.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepo extends JpaRepository<User,Long> {
    // Custom method to check if a user with this email already exists
    boolean existsByEmail(String email);

     User findByEmail(String email);

    Optional<User> findByResetToken(String resetToken);


}

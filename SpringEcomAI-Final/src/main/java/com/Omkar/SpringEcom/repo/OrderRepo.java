package com.Omkar.SpringEcom.repo;

import com.Omkar.SpringEcom.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface OrderRepo extends JpaRepository<Order, Integer> {
    Optional<Order> findByOrderId(String orderId);

    List<Order> findByEmail(String email);
}

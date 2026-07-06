package com.Omkar.SpringEcom.controller;

import com.Omkar.SpringEcom.model.dto.OrderRequest;
import com.Omkar.SpringEcom.model.dto.OrderResponse;
import com.Omkar.SpringEcom.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders") // Base URL handles the "/api/orders" part
@CrossOrigin
public class OrderController {

    @Autowired
    private OrderService orderService;

    // FIXED: Changed from "/orders/place" to "/place"
    @PostMapping("/place")
    public ResponseEntity<OrderResponse> placeOrder(@RequestBody OrderRequest orderRequest) {
        OrderResponse orderResponse = orderService.placeOrder(orderRequest);
        return new ResponseEntity<>(orderResponse, HttpStatus.CREATED);
    }

    // FIXED: Changed from "/orders" to "" (or "/") so it resolves to just "/api/orders"
    @GetMapping
    public ResponseEntity<List<OrderResponse>> getAllOrders() {
        List<OrderResponse> orderResponseList = orderService.getAllOrderResponses();
        return new ResponseEntity<>(orderResponseList, HttpStatus.OK);
    }

    // This one was already perfectly fine! It resolves to "/api/orders/my-orders"
    @GetMapping("/my-orders")
    public ResponseEntity<List<OrderResponse>> getMyOrders(@RequestParam String email) {
        List<OrderResponse> myOrders = orderService.getOrdersByEmail(email);
        return new ResponseEntity<>(myOrders, HttpStatus.OK);
    }
}
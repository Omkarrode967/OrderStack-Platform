package com.Omkar.SpringEcom.aop;

import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Component
@Aspect
public class LoggingAspect {

    private static final Logger LOGGER = LoggerFactory.getLogger(LoggingAspect.class);

    // Pointcut updated to target all methods inside ProductService
    @Before("execution(* com.Omkar.SpringEcom.service.ProductService.*(..))")
    public void logMethodCall(JoinPoint jp){
        LOGGER.info("Method Called: " + jp.getSignature().getName());
    }

    @After("execution(* com.Omkar.SpringEcom.service.ProductService.*(..))")
    public void logMethodExecuted(JoinPoint jp){
        LOGGER.info("Method Executed: " + jp.getSignature().getName());
    }

    @AfterThrowing("execution(* com.Omkar.SpringEcom.service.ProductService.*(..))")
    public void logMethodCrash(JoinPoint jp){
        LOGGER.info("Method has some issues: " + jp.getSignature().getName());
    }

    @AfterReturning("execution(* com.Omkar.SpringEcom.service.ProductService.*(..))")
    public void logMethodExecutedSuccess(JoinPoint jp){
        LOGGER.info("Method executed successfully: " + jp.getSignature().getName());
    }
}
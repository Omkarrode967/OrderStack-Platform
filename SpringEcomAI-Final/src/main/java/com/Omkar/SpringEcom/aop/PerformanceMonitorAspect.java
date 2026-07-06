package com.Omkar.SpringEcom.aop;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Component
@Aspect
public class PerformanceMonitorAspect {

    private static final Logger LOGGER = LoggerFactory.getLogger(PerformanceMonitorAspect.class);

    // Notice the wildcard: *..service.*.*(..)
    // This translates to: "Any return type, in any package structure that contains '.service.', any class, any method, any arguments"
    @Around("execution(* *..service.*.*(..))")
    public Object monitorTime(ProceedingJoinPoint jp) throws Throwable {

        long start = System.currentTimeMillis();

        Object obj = jp.proceed();

        long end = System.currentTimeMillis();

        LOGGER.info(" Performance Monitor -> Time taken by: " + jp.getSignature().getName() + "() is " + (end - start) + " ms");

        return obj;
    }
}
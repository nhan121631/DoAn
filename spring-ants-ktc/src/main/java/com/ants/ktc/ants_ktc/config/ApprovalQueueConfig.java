package com.ants.ktc.ants_ktc.config;

import java.util.concurrent.BlockingQueue;
import java.util.concurrent.Executor;
import java.util.concurrent.LinkedBlockingQueue;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import com.ants.ktc.ants_ktc.models.ApprovalMessage;

@Configuration
@EnableAsync
@EnableScheduling
public class ApprovalQueueConfig {

    @Bean("approvalQueue")
    public BlockingQueue<ApprovalMessage> approvalQueue() {
        return new LinkedBlockingQueue<>(100); // Max 100 phòng chờ duyệt trong queue
    }

    @Bean("approvalTaskExecutor")
    public Executor approvalTaskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(2); // 2 thread xử lý cùng lúc
        executor.setMaxPoolSize(3); // Tối đa 3 thread (tránh rate limit Gemini)
        executor.setQueueCapacity(100);
        executor.setThreadNamePrefix("gemini-approval-");
        executor.initialize();
        return executor;
    }
}

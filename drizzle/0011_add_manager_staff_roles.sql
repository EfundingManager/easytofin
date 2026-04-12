-- Migration: Add 'manager' and 'staff' to role enum
-- Affects: users table and phoneUsers table
-- New role hierarchy: user < staff < manager < admin

-- Alter users.role enum to include 'manager' and 'staff'
ALTER TABLE `users`
  MODIFY COLUMN `role` ENUM('user', 'admin', 'manager', 'staff') NOT NULL DEFAULT 'user';

-- Alter phoneUsers.role enum to include 'manager' and 'staff'
ALTER TABLE `phoneUsers`
  MODIFY COLUMN `role` ENUM('user', 'admin', 'manager', 'staff') NOT NULL DEFAULT 'user';

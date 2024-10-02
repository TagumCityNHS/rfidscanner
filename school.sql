CREATE DATABASE school CHARACTER SET utf8 COLLATE utf8_general_ci;
USE school;

-- Create students
CREATE TABLE students (
    id INT AUTO_INCREMENT PRIMARY KEY,
	securedlrn VARCHAR(256) NOT NULL,
    lrn VARCHAR(50) NOT NULL,
    fname VARCHAR(50) NOT NULL,
    lname VARCHAR(50) NOT NULL,
    grade VARCHAR(10) NOT NULL,
    section VARCHAR(20) NOT NULL,
    schoolyr VARCHAR(20) NOT NULL,
    contactno VARCHAR(20),
    address VARCHAR(255),
    birthday DATE,
    pname VARCHAR(100),
    email VARCHAR(100),
	fbOpt VARCHAR(50),
    status ENUM('active', 'inactive') NOT NULL
) CHARACTER SET utf8 COLLATE utf8_general_ci;

-- Create sent
CREATE TABLE sent (
    id INT AUTO_INCREMENT PRIMARY KEY,
    studentID INT NOT NULL,
    timestamp DATETIME NOT NULL,
    status ENUM('fail', 'sent', 'pend') NOT NULL,
    FOREIGN KEY (studentID) REFERENCES students(id)
) CHARACTER SET utf8 COLLATE utf8_general_ci;

-- Create scans
CREATE TABLE scans (
    id INT AUTO_INCREMENT PRIMARY KEY,
    timestamp DATETIME NOT NULL,
    studentID INT NOT NULL,
    scanner VARCHAR(50) NOT NULL,
    status ENUM('in', 'out') NOT NULL,
    lrn VARCHAR(256) NOT NULL,
    FOREIGN KEY (studentID) REFERENCES students(id)
) CHARACTER SET utf8 COLLATE utf8_general_ci;

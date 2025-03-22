-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:5713
-- Generation Time: Mar 22, 2025 at 08:27 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `employeems`
--

-- --------------------------------------------------------

--
-- Table structure for table `admin`
--

CREATE TABLE `admin` (
  `id` int(11) NOT NULL,
  `email` varchar(50) NOT NULL,
  `password` varchar(140) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `admin`
--

INSERT INTO `admin` (`id`, `email`, `password`) VALUES
(1, 'admin@gmail.com', '12345');

-- --------------------------------------------------------

--
-- Table structure for table `category`
--

CREATE TABLE `category` (
  `id` int(11) NOT NULL,
  `name` varchar(30) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `category`
--

INSERT INTO `category` (`id`, `name`) VALUES
(2, 'Development'),
(3, 'AI'),
(4, 'Computer Science');

-- --------------------------------------------------------

--
-- Table structure for table `customerdetails`
--

CREATE TABLE `customerdetails` (
  `customer_id` int(11) NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone_number` varchar(15) DEFAULT NULL,
  `company_name` varchar(255) DEFAULT NULL,
  `street_address` varchar(255) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `state` varchar(100) DEFAULT NULL,
  `postal_code` varchar(20) DEFAULT NULL,
  `country` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `customerdetails`
--

INSERT INTO `customerdetails` (`customer_id`, `full_name`, `email`, `phone_number`, `company_name`, `street_address`, `city`, `state`, `postal_code`, `country`) VALUES
(1, 'John', 'john.doe@example.com', '123-456-7890', 'Tech Solutions', '1234 Elm Street', 'Metropolis', 'NY', '12345', 'USA'),
(2, 'Jane Smith', 'jane.smith@example.com', '0987654321', NULL, '456 Oak St', 'Los Angeles', 'CA', '90001', 'USA'),
(4, 'John Doe', 'johndoe@example.com', '+1234567890', 'Doe Enterprises', '123 Main St', 'Sample City', 'Stateville', '12345', 'Sample Country'),
(10, 'Arun ', 'Arun@gmail.com', '2514545845', 'Oxipppp', 'Karachi', 'Karachi', 'dsaaf', '7896', 'Pakistan');

-- --------------------------------------------------------

--
-- Table structure for table `departments`
--

CREATE TABLE `departments` (
  `department_id` int(11) NOT NULL,
  `department_name` varchar(100) NOT NULL,
  `department_head` int(11) DEFAULT NULL,
  `street` varchar(255) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `state` varchar(100) DEFAULT NULL,
  `postal_code` varchar(20) DEFAULT NULL,
  `country` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `departments`
--

INSERT INTO `departments` (`department_id`, `department_name`, `department_head`, `street`, `city`, `state`, `postal_code`, `country`) VALUES
(24, 'AI', 9, 'Gulshan E Hadeed Phase 1', 'Karachi', 'Sindh', '4498', 'Pakistan'),
(26, 'CYS', 26, 'Gulshan E Hadeed Phase 1', 'Karachi', 'Sindh', '4498', 'Pakistan');

-- --------------------------------------------------------

--
-- Table structure for table `employee`
--

CREATE TABLE `employee` (
  `id` int(11) NOT NULL,
  `name` varchar(30) NOT NULL,
  `email` varchar(40) NOT NULL,
  `password` varchar(150) NOT NULL,
  `salary` int(11) NOT NULL,
  `address` varchar(50) NOT NULL,
  `image` varchar(60) NOT NULL,
  `category_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `employee`
--

INSERT INTO `employee` (`id`, `name`, `email`, `password`, `salary`, `address`, `image`, `category_id`) VALUES
(9, 'Partham chawla', 'pk@gmail.com', '$2b$10$NQUTPSOQTQG5Pd4AX7F49uEPr2Q5Oxw8pdfELipvcxbSnZl2hjTQq', 500, 'Gulshan E Hadeed Phase 1', 'image_1729339887751.jpg', 2),
(24, 'test', 'test@gmail.com', '$2b$10$q9mZhkexpia5JbonSuF7Qe5E8hYkcbfWzrkXfek3nGnGwbMziCrye', 300, 'Karachi', 'image_1731824153406.jpeg', 3),
(26, 'Aaryan', 'admin@gmail.com', '$2b$10$x2/IvNwU.MNEIK/TyrsyFOecICiVRmVCEK6czOIe4jvDfBInCBut2', 100, 'aaassssc dsasdfs', 'image_1732081051209.jpeg', 3),
(27, 'XYZ', 'xyz@gmail.com', '$2b$10$KBgYLvBQB3E62NYHaivAbOTznKL68kPJWH9jBmoO0/tJItcpYrz5m', 100, 'New York', 'image_1732201542459.jpg', 4);

-- --------------------------------------------------------

--
-- Table structure for table `projects`
--

CREATE TABLE `projects` (
  `id` int(11) NOT NULL,
  `projectName` varchar(255) NOT NULL,
  `customerName` varchar(255) NOT NULL,
  `startDate` date NOT NULL,
  `expectedDate` date NOT NULL,
  `budget` decimal(10,2) NOT NULL,
  `status` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `projects`
--

INSERT INTO `projects` (`id`, `projectName`, `customerName`, `startDate`, `expectedDate`, `budget`, `status`) VALUES
(1, 'Website Redesign', 'ABC Corporation', '2024-12-01', '2025-06-30', 75000.00, 'In Progress'),
(2, 'New Website Launch', 'XYZ Ltd', '2025-01-01', '2025-12-31', 100000.00, 'Pending'),
(3, 'Project X', 'John', '2024-11-18', '2024-11-25', 40000.00, 'Pending'),
(4, 'ChatBot', 'PK', '2024-11-18', '2024-11-30', 500000.00, 'In Progress'),
(5, 'ArhamkX', 'Arham', '2024-11-19', '2024-11-30', 100000.00, 'Completed'),
(6, 'Aarib\"s ChatBot', 'AarinYd', '2024-11-21', '2024-11-30', 30000.00, 'Pending');

-- --------------------------------------------------------

--
-- Table structure for table `project_parts`
--

CREATE TABLE `project_parts` (
  `part_id` int(11) NOT NULL,
  `project_id` int(11) NOT NULL,
  `part_name` varchar(255) NOT NULL,
  `employee_id` int(11) NOT NULL,
  `department` varchar(255) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `status` varchar(50) NOT NULL,
  `contribution_percentage` decimal(5,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `project_parts`
--

INSERT INTO `project_parts` (`part_id`, `project_id`, `part_name`, `employee_id`, `department`, `start_date`, `end_date`, `status`, `contribution_percentage`) VALUES
(6, 1, 'Updated Part Name', 1, 'Engineering', '2024-01-01', '2024-06-01', 'In Progress', 20.00),
(14, 2, 'Upda Part Name', 1, 'Eneering', '2024-01-01', '2024-06-01', 'In Progress', 20.00),
(19, 6, 'Design 01', 4004, 'ui ux ', '2024-11-20', '2024-11-23', 'In Progress', 20.00),
(20, 2, 'Design 01', 10, 'CS', '2024-11-21', '2024-11-29', 'Not Started', 10.00),
(21, 2, 'Design 02', 10, 'CS', '2024-11-21', '2024-11-29', 'Not Started', 10.00),
(23, 2, 'Design 03', 33, 'CS', '2024-11-21', '2024-11-28', 'In Progress', 20.00),
(24, 3, 'Design', 44, 'ai', '2024-11-21', '2024-11-28', 'Completed', 100.00),
(26, 3, 'Design 03', 223, 'czdcz', '2024-11-21', '2024-12-07', 'Completed', 50.00),
(28, 3, 'Design', 7, 'ppopoppopo', '2024-11-22', '2024-11-28', 'In Progress', 44.00),
(29, 3, 'sasdada', 2, 'as', '2024-11-22', '2024-11-15', 'In Progress', 20.00),
(30, 3, 'asdd', 756, 'jkjbyvhk', '2024-11-22', '2024-11-22', 'Not Started', 19.00),
(31, 3, 'Design 03', 78, 'ankjbjiavv', '2024-11-22', '2024-11-29', 'In Progress', 75.00),
(32, 1, 'sdfghjk', 56, 'wrty', '2024-11-22', '2024-11-30', 'In Progress', 78.00),
(33, 1, 'Designn', 22, 'sadada', '2024-11-22', '2024-11-29', 'In Progress', 99.00),
(34, 1, '98798797987', 88, '556', '2024-11-23', '2024-11-29', 'In Progress', 42.00),
(35, 4, 'Designn', 7, 'AI', '2024-11-22', '2024-11-23', 'Not Started', 45.00);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admin`
--
ALTER TABLE `admin`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `category`
--
ALTER TABLE `category`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `customerdetails`
--
ALTER TABLE `customerdetails`
  ADD PRIMARY KEY (`customer_id`);

--
-- Indexes for table `departments`
--
ALTER TABLE `departments`
  ADD PRIMARY KEY (`department_id`),
  ADD UNIQUE KEY `unique_department_name` (`department_name`);

--
-- Indexes for table `employee`
--
ALTER TABLE `employee`
  ADD PRIMARY KEY (`id`),
  ADD KEY `category_id` (`category_id`);

--
-- Indexes for table `projects`
--
ALTER TABLE `projects`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `project_parts`
--
ALTER TABLE `project_parts`
  ADD PRIMARY KEY (`part_id`),
  ADD KEY `fk_project_id` (`project_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admin`
--
ALTER TABLE `admin`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `category`
--
ALTER TABLE `category`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `customerdetails`
--
ALTER TABLE `customerdetails`
  MODIFY `customer_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `departments`
--
ALTER TABLE `departments`
  MODIFY `department_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- AUTO_INCREMENT for table `employee`
--
ALTER TABLE `employee`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=32;

--
-- AUTO_INCREMENT for table `projects`
--
ALTER TABLE `projects`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `project_parts`
--
ALTER TABLE `project_parts`
  MODIFY `part_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=36;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `employee`
--
ALTER TABLE `employee`
  ADD CONSTRAINT `employee_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `category` (`id`);

--
-- Constraints for table `project_parts`
--
ALTER TABLE `project_parts`
  ADD CONSTRAINT `fk_project_id` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

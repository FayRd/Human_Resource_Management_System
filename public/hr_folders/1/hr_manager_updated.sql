-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jul 15, 2024 at 01:46 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `hr_manager`
--

-- --------------------------------------------------------

--
-- Table structure for table `announcements`
--

CREATE TABLE `announcements` (
  `id` int(11) NOT NULL,
  `employee` int(11) NOT NULL,
  `dateCreated` datetime NOT NULL,
  `dateModified` datetime NOT NULL,
  `title` varchar(100) NOT NULL,
  `body` mediumtext NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `announcements`
--

INSERT INTO `announcements` (`id`, `employee`, `dateCreated`, `dateModified`, `title`, `body`) VALUES
(2, 1, '2029-11-15 14:37:36', '2029-11-16 11:37:36', 'The Second Announcement', 'This is the body of this announcement. It should not contain more than 300 words and must be as concise as possible.'),
(3, 2, '2029-09-12 16:17:36', '2029-09-15 06:37:25', 'The Third Announcement', 'This is the body of this announcement. It should not contain more than 300 words and must be as concise as possible.'),
(4, 2, '2029-01-04 10:37:25', '2029-05-04 20:37:25', 'The Forth Announcement', 'This is the body of this announcement. It should not contain more than 300 words and must be as concise as possible.'),
(6, 1, '2024-07-04 14:55:00', '2024-07-04 14:55:00', 'Jacob is Dying', 'Who is Jacob?'),
(8, 1, '2024-07-11 19:53:47', '2024-07-11 19:53:47', 'The Sixth Announcement', 'This is a test!');

-- --------------------------------------------------------

--
-- Table structure for table `departments`
--

CREATE TABLE `departments` (
  `id` int(11) NOT NULL,
  `name` varchar(45) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `departments`
--

INSERT INTO `departments` (`id`, `name`) VALUES
(1, 'Information Technology'),
(2, 'Sales'),
(3, 'Marketing'),
(4, 'Inventory & Logistics'),
(5, 'Human Resources & Administration'),
(6, 'Procurement'),
(7, 'Accounting'),
(8, 'Finance'),
(9, 'Manufacturing');

-- --------------------------------------------------------

--
-- Table structure for table `employees`
--

CREATE TABLE `employees` (
  `id` int(11) NOT NULL,
  `firstName` varchar(45) NOT NULL,
  `lastName` varchar(45) NOT NULL,
  `personalEmail` varchar(320) NOT NULL,
  `businessEmail` varchar(320) DEFAULT NULL,
  `personalMobile` int(15) NOT NULL,
  `businessMobile` int(15) DEFAULT NULL,
  `postal` int(10) NOT NULL,
  `address` varchar(256) NOT NULL,
  `department` int(11) NOT NULL,
  `dateJoined` date NOT NULL,
  `dateLeft` date DEFAULT NULL,
  `leaves` int(11) NOT NULL,
  `note` varchar(256) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `employees`
--

INSERT INTO `employees` (`id`, `firstName`, `lastName`, `personalEmail`, `businessEmail`, `personalMobile`, `businessMobile`, `postal`, `address`, `department`, `dateJoined`, `dateLeft`, `leaves`, `note`) VALUES
(1, 'Fayyadh', 'Rasid', 'fayyadhrasid06@gmail.com', '23019645@myrp.edu.sg', 89220097, 82001234, 730402, 'Woodlands St 41 Blk 402 #04-122', 1, '2031-07-12', NULL, 4, 'Fayyadh consistently exceeds expectations in their role. Their recent project, project Silicon, demonstrated a strong ability to prioritize tasks and meet deadlines. They are also a valuable team player, always willing to help out colleagues whenever possi'),
(2, 'Faris', 'Rasid', 'farisrasid94@gmail.com', '23245618@myrp.edu.sg', 80090127, 81011274, 730402, 'Woodlands St 41 Blk 402 #04-122', 2, '2029-08-05', NULL, 5, NULL),
(12, 'Example', 'Name', 'name@example.com', 'name@example.com', 12345678, 12312312, 730402, 'Woodlands St 41 Blk 402 #04-122', 8, '2024-07-10', NULL, 0, 'Example note!'),
(13, 'Example', 'Empty', 'name@example.com', 'name@example.com', 12345678, 12312312, 730402, 'Woodlands St 41 Blk 402 #04-122', 8, '2024-07-10', NULL, 5, 'Testing!!'),
(18, 'Example', 'Empty2', 'name@example.com', 'name@example.com', 12345678, 98765432, 730402, 'Woodlands St 41 Blk 402 #04-122', 9, '2024-07-10', NULL, 5, '');

-- --------------------------------------------------------

--
-- Table structure for table `employee_has_programme`
--

CREATE TABLE `employee_has_programme` (
  `employee` int(11) NOT NULL,
  `programme` int(11) NOT NULL,
  `enrollDate` date NOT NULL,
  `status` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `employee_has_programme`
--

INSERT INTO `employee_has_programme` (`employee`, `programme`, `enrollDate`, `status`) VALUES
(1, 1, '2024-08-04', 1),
(2, 5, '2024-07-11', 2),
(12, 4, '2024-07-10', 4),
(1, 2, '2024-07-11', 2),
(1, 4, '2024-07-11', 3),
(18, 13, '2024-07-14', 1);

-- --------------------------------------------------------

--
-- Table structure for table `files`
--

CREATE TABLE `files` (
  `id` int(11) NOT NULL,
  `folder` int(11) NOT NULL,
  `name` varchar(45) NOT NULL,
  `size` int(11) NOT NULL,
  `type` varchar(45) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `files`
--

INSERT INTO `files` (`id`, `folder`, `name`, `size`, `type`) VALUES
(4, 17, 'C206_L09_Worksheet.docx', 1602684, 'application/vnd.openxmlformats-officedocument'),
(5, 17, 'module-essay.docx', 16941, 'application/vnd.openxmlformats-officedocument');

-- --------------------------------------------------------

--
-- Table structure for table `folders`
--

CREATE TABLE `folders` (
  `id` int(11) NOT NULL,
  `name` varchar(45) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `folders`
--

INSERT INTO `folders` (`id`, `name`) VALUES
(17, 'Employee Onboarding'),
(18, 'Department Overview');

-- --------------------------------------------------------

--
-- Table structure for table `programmes`
--

CREATE TABLE `programmes` (
  `id` int(11) NOT NULL,
  `category` int(11) NOT NULL,
  `name` varchar(45) NOT NULL,
  `lead` int(11) NOT NULL,
  `lessons` int(11) NOT NULL,
  `duration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `programmes`
--

INSERT INTO `programmes` (`id`, `category`, `name`, `lead`, `lessons`, `duration`) VALUES
(1, 1, 'Introduction to Company Culture', 2, 5, 12),
(2, 1, 'Understanding Benefits & Perks', 1, 5, 10),
(3, 1, 'Facilities & Resource Tour', 2, 2, 5),
(4, 4, 'Introduction to Problem Solving Techniques', 2, 3, 7),
(5, 4, 'Critical Thinking & Decision Making', 1, 4, 8),
(6, 4, 'Effective Communication for Problem Solving', 2, 3, 6),
(7, 3, 'Developing Leadership Skills', 1, 5, 10),
(8, 3, 'Motivating and Inspiring Teams', 2, 4, 8),
(9, 3, 'Delegation and Empowerment', 2, 3, 6),
(10, 1, 'Testing Subprogramme 1-4', 12, 5, 5),
(11, 1, 'Testing Subprogramme 1-5', 18, 1, 2),
(13, 5, 'Testing Subprogramme 5-1', 12, 5, 5);

-- --------------------------------------------------------

--
-- Table structure for table `programmetypes`
--

CREATE TABLE `programmetypes` (
  `id` int(11) NOT NULL,
  `name` varchar(45) NOT NULL,
  `description` varchar(256) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `programmetypes`
--

INSERT INTO `programmetypes` (`id`, `name`, `description`) VALUES
(1, 'Orientation', 'Introduces new employees to the company, the culture, and their role.'),
(2, 'Technical Training', 'Focuses on specific skills or knowledge needed to perform a job effectively.'),
(3, 'Leadership Training', 'Helps employees develop the skills and knowledge to lead and manage others.'),
(4, 'Problem Solving', 'Equip individuals with the skills and strategies to effectively approach and overcome challenges.'),
(5, '5th Category', 'Testing the 5th category!!');

-- --------------------------------------------------------

--
-- Table structure for table `statuses`
--

CREATE TABLE `statuses` (
  `id` int(11) NOT NULL,
  `name` varchar(45) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `statuses`
--

INSERT INTO `statuses` (`id`, `name`) VALUES
(1, 'Completed'),
(2, 'Dropped'),
(3, 'On-Hold'),
(4, 'In-Progress');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `employee` int(11) NOT NULL,
  `username` varchar(45) NOT NULL,
  `password` varchar(45) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `employee`, `username`, `password`) VALUES
(1, 1, 'Fayyadh Rasid', '1234');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `announcements`
--
ALTER TABLE `announcements`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `departments`
--
ALTER TABLE `departments`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `employees`
--
ALTER TABLE `employees`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `files`
--
ALTER TABLE `files`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `folders`
--
ALTER TABLE `folders`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `programmes`
--
ALTER TABLE `programmes`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `programmetypes`
--
ALTER TABLE `programmetypes`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `statuses`
--
ALTER TABLE `statuses`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `announcements`
--
ALTER TABLE `announcements`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `departments`
--
ALTER TABLE `departments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `employees`
--
ALTER TABLE `employees`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT for table `files`
--
ALTER TABLE `files`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `folders`
--
ALTER TABLE `folders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT for table `programmes`
--
ALTER TABLE `programmes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `programmetypes`
--
ALTER TABLE `programmetypes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `statuses`
--
ALTER TABLE `statuses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

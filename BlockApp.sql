
CREATE DATABASE ProjectFSA;
GO


USE ProjectFSA;
GO

IF OBJECT_ID('Role', 'U') IS NOT NULL
    DROP TABLE Role;
GO

CREATE TABLE Role (
    id INT IDENTITY(1,1) PRIMARY KEY,
    roleName VARCHAR(50) UNIQUE NOT NULL
);
GO

INSERT INTO Role (roleName)
VALUES ('Admin'), ('User');
GO

CREATE TABLE Account (
    id INT IDENTITY(1,1) PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    username VARCHAR(50) NOT NULL,
    password VARCHAR(255) NOT NULL,
    isActive BIT DEFAULT 1,
    isVerified BIT DEFAULT 0,
    f2aEnabled BIT DEFAULT 0,
    createdAt DATETIME DEFAULT GETDATE(),
    updatedAt DATETIME DEFAULT GETDATE(),
);
GO

CREATE TABLE AccountRole (
    accountId INT NOT NULL,
    roleId INT NOT NULL,
    PRIMARY KEY (accountId, roleId),
    FOREIGN KEY (accountId) REFERENCES Account(id),
    FOREIGN KEY (roleId) REFERENCES Role(id)
);
GO

CREATE TABLE AdminProfile (
    id INT IDENTITY(1,1) PRIMARY KEY,
    accountId INT NOT NULL UNIQUE FOREIGN KEY REFERENCES Account(id),
    fullName VARCHAR(100) NOT NULL,
    phoneNumber VARCHAR(15),
    dob DATE,
    imgUrl VARCHAR(255),
    coverImg VARCHAR(255),
    createdAt DATETIME DEFAULT GETDATE(),
    updatedAt DATETIME DEFAULT GETDATE()
);
GO

CREATE TABLE UserProfile (
    id INT IDENTITY(1,1) PRIMARY KEY,
    accountId INT NOT NULL UNIQUE FOREIGN KEY REFERENCES Account(id),
    fullName VARCHAR(100) NOT NULL,
    phoneNumber VARCHAR(15),
    dob DATE,
    imgUrl VARCHAR(255),
    coverImg VARCHAR(255),
    createdAt DATETIME DEFAULT GETDATE(),
    updatedAt DATETIME DEFAULT GETDATE()
);
GO

CREATE TABLE Follow (
    followerId INT NOT NULL,
    followingId INT NOT NULL,
    followAt DATETIME DEFAULT GETDATE(),
    PRIMARY KEY (followerId, followingId),
    FOREIGN KEY (followerId) REFERENCES Account(id),
    FOREIGN KEY (followingId) REFERENCES Account(id)
);
GO

CREATE TABLE OTP (
    id INT IDENTITY(1,1) PRIMARY KEY,
    otp VARCHAR(10) NOT NULL,
    userId INT NOT NULL,
    used BIT DEFAULT 0,
    createdAt DATETIME DEFAULT GETDATE(),
    usedAt DATETIME NULL,           
    expireAt DATETIME NOT NULL,
    FOREIGN KEY (userId) REFERENCES Account(id)
);
GO

CREATE TABLE Blogs (
    id INT IDENTITY(1,1) PRIMARY KEY,
    text NVARCHAR(MAX),
    creatorId INT NOT NULL,
    isDeleted BIT DEFAULT 0,
    createdAt DATETIME DEFAULT GETDATE(),
    updatedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (creatorId) REFERENCES Account(id)
);
GO

CREATE TABLE Comments (
    id INT IDENTITY(1,1) PRIMARY KEY,
    userId INT NOT NULL,
    blogId INT NOT NULL,
    text VARCHAR(MAX) NULL,
    image VARCHAR(255) NULL,
    createdAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (userId) REFERENCES Account(id),
    FOREIGN KEY (blogId) REFERENCES Blogs(id)
);
GO

CREATE TABLE [Like] (
    userId INT NOT NULL,
    blogId INT NOT NULL,
    PRIMARY KEY (userId, blogId),
    FOREIGN KEY (userId) REFERENCES Account(id),
    FOREIGN KEY (blogId) REFERENCES Blogs(id)
);
GO

CREATE TABLE Messages (
    id INT IDENTITY(1,1) PRIMARY KEY,
    senderId INT NOT NULL,
    receiverId INT NOT NULL,
    roomId VARCHAR(50) NOT NULL,
    text NVARCHAR(MAX) NOT NULL,
    type VARCHAR(20) Default 'text',
    createdAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (senderId) REFERENCES Account(id),
    FOREIGN KEY (receiverId) REFERENCES Account(id)
);
GO

CREATE TABLE Reports (
    id INT IDENTITY(1,1) PRIMARY KEY,
    blogId INT NULL,
    reason NVARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'Pending',
    createdAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (blogId) REFERENCES Blogs(id),
)

GO

IF NOT EXISTS (SELECT 1 FROM Role WHERE roleName = 'Admin')
    INSERT INTO Role (roleName) VALUES ('Admin');
GO


DECLARE @adminRoleId INT = (SELECT id FROM Role WHERE roleName = 'Admin');

IF NOT EXISTS (SELECT 1 FROM Account WHERE username = 'admin' OR email = 'admin@local')
BEGIN
    INSERT INTO Account (email, username, password, isActive)
    VALUES ('admin@local', 'admin', '$2b$10$IJZep4/g/MohiMHD3NrYBu/WoKx..DnFSs.q2f2k2Fn58Tmd4eyVe', 1);

    DECLARE @adminAccountId INT = SCOPE_IDENTITY();

    INSERT INTO AccountRole (accountId, roleId)
    VALUES (@adminAccountId, @adminRoleId);

    INSERT INTO AdminProfile (accountId, fullName, phoneNumber, dob)
    VALUES (@adminAccountId, 'Default Admin', NULL, NULL);
END;
GO


CREATE TRIGGER trg_Update_Account
ON Account
AFTER UPDATE
AS
BEGIN
    UPDATE Account
    SET updatedAt = GETDATE()
    FROM Account a
    INNER JOIN inserted i ON a.id = i.id;
END;
GO

CREATE TABLE BlogMedia (
    id INT IDENTITY(1,1) PRIMARY KEY,
    blogId INT NOT NULL,
    mediaUrl VARCHAR(255) NOT NULL,
    mediaType VARCHAR(20) NOT NULL,
    createdAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (blogId) REFERENCES Blogs(id)
);
GO

GO
-- Chạy lệnh này trong SQL Server Management Studio

CREATE TABLE CommentLikes (
    userId INT NOT NULL,
    commentId INT NOT NULL,
    createdAt DATETIME DEFAULT GETDATE(),
    PRIMARY KEY (userId, commentId),
    FOREIGN KEY (userId) REFERENCES Account(id),
    FOREIGN KEY (commentId) REFERENCES Comments(id) -- Đảm bảo bảng Comments đã tồn tại
);
GO

ALTER TABLE Comments 
ADD parentId INT NULL;

ALTER TABLE Comments
ADD CONSTRAINT FK_Comments_Parent 
FOREIGN KEY (parentId) REFERENCES Comments(id);

GO




CREATE PROCEDURE CleanupExpiredOTP
AS
BEGIN
    DELETE FROM OTP 
    WHERE expireAt < DATEADD(DAY, -7, GETDATE())
      OR (used = 1 AND usedAt < DATEADD(DAY, -7, GETDATE()));
END;
GO

-- update 27/11/2025 - trang thai table comment
ALTER TABLE Comments ADD isHidden BIT DEFAULT 0;
ALTER TABLE Comments ADD updatedAt DATETIME;


-- Table để lưu thông tin share
CREATE TABLE BlogShares (
    id INT IDENTITY(1,1) PRIMARY KEY,
    blogId INT NOT NULL, -- Bài viết mới (bài share)
    originalBlogId INT NOT NULL, -- Bài viết gốc được share
    userId INT NOT NULL, -- Người share
    text NVARCHAR(MAX) NULL, -- Nội dung kèm theo khi share
    createdAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (blogId) REFERENCES Blogs(id),
    FOREIGN KEY (originalBlogId) REFERENCES Blogs(id),
    FOREIGN KEY (userId) REFERENCES Account(id)
);
GO

-- Thêm index để tối ưu query
CREATE INDEX IX_BlogShares_BlogId ON BlogShares(blogId);
CREATE INDEX IX_BlogShares_OriginalBlogId ON BlogShares(originalBlogId);
CREATE INDEX IX_BlogShares_UserId ON BlogShares(userId);
GO

-- Thêm column shareCount vào bảng Blogs (optional, để đếm nhanh)
ALTER TABLE Blogs ADD shareCount INT DEFAULT 0;
GO

-- Trigger để tự động tăng shareCount khi có share mới
CREATE TRIGGER trg_IncrementShareCount
ON BlogShares
AFTER INSERT
AS
BEGIN
    UPDATE Blogs
    SET shareCount = shareCount + 1
    FROM Blogs b
    INNER JOIN inserted i ON b.id = i.originalBlogId;
END;
GO

-- Trigger để giảm shareCount khi xóa share (nếu cần)
CREATE TRIGGER trg_DecrementShareCount
ON BlogShares
AFTER DELETE
AS
BEGIN
    UPDATE Blogs
    SET shareCount = shareCount - 1
    FROM Blogs b
    INNER JOIN deleted d ON b.id = d.originalBlogId
    WHERE b.shareCount > 0;
END;
GO
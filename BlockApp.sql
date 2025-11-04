
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
VALUES ('user'), ('admin');
GO

CREATE TABLE Account (
    id INT IDENTITY(1,1) PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    roleId INT,
    isActive BIT DEFAULT 1,
    createdAt DATETIME DEFAULT GETDATE(),
    updatedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (roleId) REFERENCES Role(id)
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
    fullName VARCHAR(100) NOT NULL,
    phoneNumber VARCHAR(15),
    dob DATE,
    createdAt DATETIME DEFAULT GETDATE(),
    updatedAt DATETIME DEFAULT GETDATE()
);
GO

CREATE TABLE UserProfile (
    id INT IDENTITY(1,1) PRIMARY KEY,
    fullName VARCHAR(100) NOT NULL,
    phoneNumber VARCHAR(15),
    dob DATE,
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
    createdAt DATETIME DEFAULT GETDATE(),
    expireAt DATETIME NOT NULL,
    FOREIGN KEY (userId) REFERENCES Account(id)
);
GO

CREATE TABLE Blogs (
    id INT IDENTITY(1,1) PRIMARY KEY,
    text TEXT,
    image VARCHAR(255),
    video VARCHAR(255),
    creatorId INT NOT NULL,
    createdAt DATETIME DEFAULT GETDATE(),
    updatedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (creatorId) REFERENCES Account(id)
);
GO

CREATE TABLE Comments (
    id INT IDENTITY(1,1) PRIMARY KEY,
    userId INT NOT NULL,
    blogId INT NOT NULL,
    comment TEXT NOT NULL,
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

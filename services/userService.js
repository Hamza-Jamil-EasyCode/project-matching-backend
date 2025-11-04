const User = require("../models/User");

class UserService {
  // Create a new user
  async createUser(userData) {
    try {
      const user = new User(userData);
      await user.save();
      return user;
    } catch (error) {
      if (error.code === 11000) {
        throw new Error("Email already exists");
      }
      throw error;
    }
  }

  // Find user by email
  async findByEmail(email) {
    return await User.findOne({ email });
  }

  // Find user by email with password (for login)
  async findByEmailWithPassword(email) {
    return await User.findByEmailWithPassword(email);
  }

  // Find user by ID
  async findById(id) {
    return await User.findById(id)
      .populate("connections")
      .populate("pendingConnections");
  }

  // Update user
  async updateUser(id, updateData) {
    return await User.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
  }

  // Update last login
  async updateLastLogin(id) {
    return await User.findByIdAndUpdate(
      id,
      {
        lastLogin: new Date(),
      },
      { new: true }
    );
  }

  // Get all users (for admin)
  async getAllUsers() {
    return await User.find({ isActive: true }).select("-password");
  }

  // Delete user
  async deleteUser(id) {
    return await User.findByIdAndDelete(id);
  }

  // Check if user exists
  async userExists(email) {
    const user = await User.findOne({ email });
    return !!user;
  }

  // Helper method to check if two words are similar
  areWordsSimilar(word1, word2) {
    // Remove common suffixes and prefixes
    const normalize = (word) =>
      word.replace(/[-_]/g, "").replace(/(s|ing|ed|er|ly)$/, "");

    const norm1 = normalize(word1);
    const norm2 = normalize(word2);

    // Check if normalized words are similar
    if (norm1 === norm2) return true;

    // Check if one word contains the other (handles compound words)
    if (norm1.includes(norm2) || norm2.includes(norm1)) return true;

    // Check for common project-related word variations
    const projectVariations = {
      university: ["university", "uni", "college", "school"],
      management: ["management", "manage", "admin", "administration"],
      system: ["system", "platform", "app", "application"],
      student: ["student", "learner", "user", "member"],
      matching: ["matching", "match", "connect", "pairing"],
      project: ["project", "assignment", "task", "work"],
      web: ["web", "website", "site", "online"],
      mobile: ["mobile", "app", "application", "phone"],
      ai: ["ai", "artificial", "intelligence", "machine"],
      data: ["data", "database", "information", "analytics"],
    };

    for (const [key, variations] of Object.entries(projectVariations)) {
      if (variations.includes(norm1) && variations.includes(norm2)) {
        return true;
      }
    }

    return false;
  }

  // Find matching users based on interests, skills, and project ideas
  async findMatches(currentUser) {
    try {
      // Find all users to whom the current user has sent connection requests
      // These users have currentUser._id in their pendingConnections array
      const usersWithSentRequests = await User.find({
        pendingConnections: currentUser._id,
        isActive: true,
      }).select("_id");

      const sentRequestUserIds = usersWithSentRequests.map((user) => user._id);

      // Extract IDs from connections and pendingConnections (handle both ObjectId and populated objects)
      const connectionIds = currentUser.connections.map(
        (conn) => conn._id || conn
      );
      const pendingConnectionIds = currentUser.pendingConnections.map(
        (pending) => pending._id || pending
      );

      const excludedUserIds = [
        currentUser._id,
        ...connectionIds,
        ...pendingConnectionIds,
        ...sentRequestUserIds,
      ];

      // Get all users except the current user
      const allUsers = await User.find({
        _id: { $nin: excludedUserIds },
        role: { $ne: "admin" },
        isActive: true,
      });

      const matches = [];

      for (const user of allUsers) {
        let matchScore = 0;
        const matchReasons = [];

        // Check for shared interests (keyword matching)
        if (currentUser.interest && user.interest) {
          const currentInterests = currentUser.interest
            .toLowerCase()
            .split(/[,\s\-_]+/)
            .filter((i) => i.length > 2);
          const userInterests = user.interest
            .toLowerCase()
            .split(/[,\s\-_]+/)
            .filter((i) => i.length > 2);

          const sharedInterests = currentInterests.filter((interest) =>
            userInterests.some(
              (userInterest) =>
                userInterest.includes(interest) ||
                interest.includes(userInterest) ||
                this.areWordsSimilar(interest, userInterest)
            )
          );

          if (sharedInterests.length > 0) {
            matchScore += sharedInterests.length * 2;
            matchReasons.push(
              `Shared interests: ${sharedInterests.join(", ")}`
            );
          }
        }

        // Check for shared skills
        if (currentUser.skills && user.skills) {
          const sharedSkills = currentUser.skills.filter((skill) =>
            user.skills.some(
              (userSkill) =>
                userSkill.toLowerCase().includes(skill.toLowerCase()) ||
                skill.toLowerCase().includes(userSkill.toLowerCase()) ||
                this.areWordsSimilar(
                  skill.toLowerCase(),
                  userSkill.toLowerCase()
                )
            )
          );

          if (sharedSkills.length > 0) {
            matchScore += sharedSkills.length * 3;
            matchReasons.push(`Shared skills: ${sharedSkills.join(", ")}`);
          }
        }

        // Check for similar project ideas (keyword matching)
        // if (currentUser.projectIdea && user.projectIdea) {
        const currentKeywords = currentUser.projectIdea
          .toLowerCase()
          .split(/[,\s\-_]+/)
          .filter((k) => k.length > 2);
        const userKeywords = user.projectIdea
          .toLowerCase()
          .split(/[,\s\-_]+/)
          .filter((k) => k.length > 2);

        const sharedKeywords = currentKeywords.filter((keyword) =>
          userKeywords.some(
            (userKeyword) =>
              userKeyword.includes(keyword) ||
              keyword.includes(userKeyword) ||
              // Check for similar words (handles cases like "university" vs "university-management")
              this.areWordsSimilar(keyword, userKeyword)
          )
        );

        if (sharedKeywords.length > 0) {
          matchScore += sharedKeywords.length;
          matchReasons.push(
            `Similar project keywords: ${sharedKeywords.slice(0, 3).join(", ")}`
          );
        }
        // }

        // Only include users with at least one match
        if (matchScore > 0) {
          matches.push({
            user: {
              _id: user._id,
              name: user.name,
              email: user.email,
              programOfStudy: user.programOfStudy,
              interest: user.interest,
              skills: user.skills,
              projectIdea: user.projectIdea,
              availabilityDate: user.availabilityDate,
              createdAt: user.createdAt,
            },
            matchScore,
            matchReasons,
            compatibility: Math.min(100, Math.round((matchScore / 10) * 100)), // Convert to percentage
          });
        }
      }

      // Sort by match score (highest first)
      matches.sort((a, b) => b.matchScore - a.matchScore);

      return matches;
    } catch (error) {
      throw new Error(`Failed to find matches: ${error.message}`);
    }
  }

  // Send connection request to another user
  async sendConnectionRequest(currentUserId, targetUserId) {
    try {
      // Check if target user exists
      const targetUser = await User.findById(targetUserId);
      if (!targetUser) {
        throw new Error("Target user not found");
      }

      // Check if target user is active
      if (!targetUser.isActive) {
        throw new Error("Target user is not active");
      }

      // Check if users are the same
      if (currentUserId.toString() === targetUserId.toString()) {
        throw new Error("Cannot send connection request to yourself");
      }

      // Check if already connected
      const currentUser = await User.findById(currentUserId);
      if (currentUser.connections.includes(targetUserId)) {
        throw new Error("Already connected with this user");
      }

      // Check if already in pending connections
      if (targetUser.pendingConnections.includes(currentUserId)) {
        throw new Error("Connection request already sent");
      }

      // Check if current user is in target user's pending connections (reverse request)
      if (currentUser.pendingConnections.includes(targetUserId)) {
        throw new Error("This user has already sent you a connection request");
      }

      // Add current user to target user's pending connections
      await User.findByIdAndUpdate(
        targetUserId,
        { $addToSet: { pendingConnections: currentUserId } },
        { new: true }
      );

      return {
        success: true,
        message: "Connection request sent successfully",
      };
    } catch (error) {
      throw new Error(`Failed to send connection request: ${error.message}`);
    }
  }

  // Respond to connection request (accept or reject)
  async respondToConnectionRequest(currentUserId, connectionId, status) {
    try {
      // Check if connectionId is valid
      const connectionUser = await User.findById(connectionId);
      if (!connectionUser) {
        throw new Error("Connection user not found");
      }

      // Get current user
      const currentUser = await User.findById(currentUserId);
      if (!currentUser) {
        throw new Error("Current user not found");
      }

      // Check if the connectionId is in current user's pendingConnections
      if (!currentUser.pendingConnections.includes(connectionId)) {
        throw new Error("No pending connection request found from this user");
      }

      if (status === "accept") {
        // Remove from pendingConnections and add to connections for both users
        await User.findByIdAndUpdate(currentUserId, {
          $pull: { pendingConnections: connectionId },
          $addToSet: { connections: connectionId },
        });

        await User.findByIdAndUpdate(connectionId, {
          $addToSet: { connections: currentUserId },
        });

        return {
          success: true,
          message: "Connection request accepted successfully",
        };
      } else if (status === "reject") {
        // Remove from pendingConnections only
        await User.findByIdAndUpdate(currentUserId, {
          $pull: { pendingConnections: connectionId },
        });

        return {
          success: true,
          message: "Connection request rejected successfully",
        };
      } else {
        throw new Error('Invalid status. Must be "accept" or "reject"');
      }
    } catch (error) {
      throw new Error(
        `Failed to respond to connection request: ${error.message}`
      );
    }
  }

  // Delete user by ID (admin only)
  async deleteUser(userId) {
    try {
      // Check if user exists
      const user = await User.findById(userId);
      if (!user) {
        throw new Error("User not found");
      }

      // Check if user is already deleted/inactive
      if (!user.isActive) {
        throw new Error("User is already inactive");
      }

      // Soft delete: Set isActive to false instead of hard delete
      await User.findByIdAndUpdate(
        userId,
        {
          isActive: false,
          lastLogin: new Date(),
        },
        { new: true }
      );

      return {
        success: true,
        message: "User deleted successfully",
      };
    } catch (error) {
      throw new Error(`Failed to delete user: ${error.message}`);
    }
  }
}

module.exports = new UserService();

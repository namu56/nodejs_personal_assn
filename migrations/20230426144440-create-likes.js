"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Likes", {
      likeId: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      UserId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: "Users", // Users 모델을 참조합니다.
          key: "userId", // Users 모델의 userId를 참조합니다.
        },
      },
      PostId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: "Posts", // Posts 모델을 참조합니다.
          key: "postId", // Posts 모델의 postId를 참조합니다.
        },
        onDelete: "CASCADE", // 만약 Posts 모델의 postId가 삭제되면, Comments 모델의 데이터가 삭제됩니다.
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn("now"),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn("now"),
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Likes");
  },
};

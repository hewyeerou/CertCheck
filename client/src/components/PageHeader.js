import React, { useState, useEffect } from "react";
import "antd/dist/antd.css";
import { Image, Row, Typography, Col, Button, Avatar } from "antd";
import { LogoutOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const PageHeader = () => {
  let navigate = useNavigate();

  let user = JSON.parse(localStorage.getItem("user"));

  const onClickLogout = () => {
    localStorage.clear();
    navigate("/logout")
  };

  return (
    <>
      <Row type="flex" justify="space-around" align="middle">
        <Col span={4}>
          <Image
            src="/cc-logo.png"
            preview={false}
            style={{ height: "50px" }}
          />
        </Col>
        {/* <Col span={4} /> */}
        <Col span={4} offset={12}>
          <Row>
            <Col style={{ paddingRight: "10px" }}>
              <Avatar style={{ color: "#f56a00", backgroundColor: "#fde3cf" }}>
                U
              </Avatar>
            </Col>
            <Col>
              {user && <Typography>{user.name}</Typography>}
            </Col>
          </Row>
        </Col>
        <Col span={4}>
          <Button
            type="primary"
            icon={<LogoutOutlined />}
            onClick={onClickLogout}
          >
            Logout
          </Button>{" "}
        </Col>
      </Row>
    </>
  );
};

export default PageHeader;

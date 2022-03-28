import React, { useState, useEffect } from "react";
import { Menu } from "antd";
import { Link } from "react-router-dom";

const PageSider = () => {
  return (
    <>
      <Menu theme="dark" mode="inline" defaultSelectedKeys={["1"]}>
        <Menu.Item key="1">Digital Certificate</Menu.Item>
        <Menu.Item key="2">Certificate Request</Menu.Item>
        <Menu.Item key="3">Viewing Rights</Menu.Item>
        <Menu.Item key="4">About Us</Menu.Item>
      </Menu>
    </>
  );
};

export default PageSider;

import React, { useState, useEffect } from "react";
import { Menu } from "antd";
import { Link } from "react-router-dom";
import Page from "../components/Page";

const PageSider = () => {
  return (
    <>
      <Menu theme="dark" mode="inline" defaultSelectedKeys={["1"]}>
        <Menu.Item key="1">
          Digital Certificate
          <Link to={"/viewCert"}></Link>
        </Menu.Item>
        <Menu.Item key="2">
          Certificate Request
          <Link to={"/viewReq"}></Link>
        </Menu.Item>
        <Menu.Item key="3">Viewing Rights</Menu.Item>
        <Menu.Item key="4">About Us</Menu.Item>
      </Menu>
    </>
  );
};

export default PageSider;

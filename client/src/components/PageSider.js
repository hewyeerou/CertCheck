import React, { useState, useEffect } from "react";
import { Menu } from "antd";
import { useNavigate, useLocation, Link } from "react-router-dom";
import Page from "./Page";

const PageSider = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();
  const location = useLocation();

  const [path, setPath] = useState();

  const handleClick = (e) => {
    console.log("click ", e);
  };

  useEffect(() => {
    if (location.pathname === "/student/viewCert") {
      setPath("1");
    } else if (location.pathname === "/student/viewReq") {
      setPath("2");
    } else if (location.pathname === "/student/viewVer") {
      setPath("3");
    } else if (location.pathname === "/issuer/viewRequests") {
      setPath("5");
    } else if (location.pathname === "/issuer/viewIssued") {
      setPath("6");
    } else if (location.pathname === "/verifier/viewStudentCert") {
      setPath("8");
    }
  }, []);

  return (
    <>
      {user.type === "Student" && path && (
        <Menu theme="dark" mode="inline" defaultSelectedKeys={[path]}>
          <Menu.Item key="1">
            <Link to="/student/viewCert">Digital Certificate</Link>
          </Menu.Item>
          <Menu.Item key="2">
            <Link to="/student/viewReq">Certificate Request</Link>
          </Menu.Item>
          <Menu.Item key="3">
            <Link to="/student/viewVer">Viewing Rights</Link>
          </Menu.Item>
          <Menu.Item key="4">About Us</Menu.Item>
        </Menu>
      )}
      {user.type === "Issuer" && path && (
        <Menu theme="dark" mode="inline" defaultSelectedKeys={[path]}>
          <Menu.Item key="5">
            <Link to="/issuer/viewRequests">
              <span>View all Requests</span>
            </Link>
          </Menu.Item>
          <Menu.Item key="6">
            <Link to="/issuer/viewIssued">
              <span>View all Issued</span>
            </Link>
          </Menu.Item>
          <Menu.Item key="7">About Us</Menu.Item>
        </Menu>
      )}

      {user.type === "Verifier" && path && (
        <Menu theme="dark" mode="inline" defaultSelectedKeys={[path]}>
          <Menu.Item key="8">
            <Link to="/verifier/viewStudentCert">
              <span>View all Requests</span>
            </Link>
          </Menu.Item>
          <Menu.Item key="9">About Us</Menu.Item>
        </Menu>
      )}
    </>
  );
};

export default PageSider;

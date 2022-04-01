import React, { useState, useEffect } from "react";
import { Menu } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import Page from "./Page";

const PageSider = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    const navigate = useNavigate();
    const location = useLocation(); 

    const [path, setPath] = useState();

    const handleClick = e => {
        console.log('click ', e);
    };

    useEffect(() => {
        if(location.pathname === "/student/viewCert") {
            setPath("1")
        } else if(location.pathname === "/student/viewReq") {
            setPath("2")
        } else if(location.pathname === "/student/viewVer") {
            setPath("3")
        } else if(location.pathname === "/issuer/viewRequests") {
            setPath("5")
        } else if(location.pathname === "/issuer/viewIssued") {
            setPath("6")
        } else if(location.pathname === "/verifier/viewStudentCert") {
            setPath("8")
        }
    }, []);

    return (
        <>
            {user.type === 'Student' && path && (
                <Menu theme='dark' mode='inline' defaultSelectedKeys={[path]}>
                    <Menu.Item key='1'>
                        <a href="/student/viewCert">
                            Digital Certificate
                        </a>
                    </Menu.Item>
                    <Menu.Item key='2'>
                        <a href="/student/viewReq">
                            Certificate Request
                        </a>
                    </Menu.Item>
                    <Menu.Item key='3'>
                        <a href="/student/viewVer">
                            Viewing Rights
                        </a>
                    </Menu.Item>
                    <Menu.Item key='4'>About Us</Menu.Item>
                </Menu>
            )}
            {user.type === 'Issuer' && path && (
                <Menu theme='dark' mode='inline' defaultSelectedKeys={[path]}>
                    <Menu.Item key='5'> 
                        <a href="/issuer/viewRequests">
                            <span>View all Requests</span>
                        </a>             
                    </Menu.Item>
                    <Menu.Item key='6'>
                    <a href="/issuer/viewIssued">
                            <span>View all Issued</span>
                        </a>    
                    </Menu.Item>
                    <Menu.Item key='7'>About Us</Menu.Item>
                </Menu>
            )}

            {user.type === "Verifier" && path && (
                <Menu theme='dark' mode='inline' defaultSelectedKeys={[path]}>
                    <Menu.Item key='8'> 
                        <a href="/verifier/viewStudentCert">
                            <span>View all Requests</span>
                        </a>             
                    </Menu.Item>
                    <Menu.Item key='9'>About Us</Menu.Item>
                </Menu>
            )}
        </>
    );
};

export default PageSider;

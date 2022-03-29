import React, { useState, useEffect } from "react";
import { Menu } from "antd";
import { Link, NavLink, Router } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import Page from "./Page";

const PageSider = () => {
    let user = JSON.parse(localStorage.getItem("user"));
    let navigate = useNavigate();

    const handleClick = e => {
        console.log('click ', e);
    };

    return (
        <>
            {user.type === 'Student' && (
                <Menu theme='dark' mode='inline' defaultSelectedKeys={['1']}>
                    <Menu.Item key='1'>Digital Certificate</Menu.Item>
                    <Menu.Item key='2'>Certificate Request</Menu.Item>
                    <Menu.Item key='3'>Viewing Rights</Menu.Item>
                    <Menu.Item key='4'>About Us</Menu.Item>
                </Menu>
            )}
            {user.type === 'Issuer' && (
                <Menu theme='dark' mode='inline' defaultSelectedKeys={['1']} onClick={handleClick}>
                    <Menu.Item key='1'> 
                        <a href="/issuer/viewRequests">
                            <span>View all Requests</span>
                        </a>             
                    </Menu.Item>
                    <Menu.Item key='2' >
                    <a href="/issuer/viewIssued">
                            <span>View all Issued</span>
                        </a>    
                    </Menu.Item>
                    <Menu.Item key='4'>About Us</Menu.Item>
                </Menu>
            )}

            {user.type === "Verifier" && (
                <Menu theme='dark' mode='inline' defaultSelectedKeys={['1']} onClick={handleClick}>
                    <Menu.Item key='1'> 
                        <a href="/verifier/viewStudentCert">
                            <span>View all Requests</span>
                        </a>             
                    </Menu.Item>
                    <Menu.Item key='2'>About Us</Menu.Item>
                </Menu>
            )}
        </>
    );
};

export default PageSider;

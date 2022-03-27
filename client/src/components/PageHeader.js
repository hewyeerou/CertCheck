import React, { useState, useEffect } from 'react';
import { Image, Row, Typography, Col, Button, Avatar } from 'antd';
import { LogoutOutlined } from '@ant-design/icons';

const PageHeader = () => {
    return (
        <>
            <Row type='flex' justify='space-around' align='middle'>
                <Col span={4}>
                    <Image src='cc-logo.png' preview={false} style={{ height: '50px' }} />
                </Col>
                {/* <Col span={4} /> */}
                <Col span={4} offset={12}>
                    <Row>
                        <Col style={{ paddingRight: '10px' }}>
                            <Avatar style={{ color: '#f56a00', backgroundColor: '#fde3cf' }}>U</Avatar>
                        </Col>
                        <Col>
                            <Typography>User</Typography>
                        </Col>
                    </Row>
                </Col>
                <Col span={4}>
                    <Button type='primary' icon={<LogoutOutlined />}>
                        Logout
                    </Button>{' '}
                </Col>
            </Row>
        </>
    );
};

export default PageHeader;

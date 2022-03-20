import { Card, Button, Row, Col, Typography } from 'antd';
import React, { useState, useEffect } from 'react';
import { EyeOutlined } from '@ant-design/icons';

const ViewAllCertificates = ({ certificates }) => {
    return (
        <div>
            <Row type='flex' justify='space-around' align='middle'>
                {certificates.map((certificate) => (
                    <Col style={{ paddingTop: '10px' }}>
                        <Card
                            style={{ width: '350px' }}
                            actions={[<Button icon={<EyeOutlined />}>View Certificate</Button>]}
                        >
                            <Typography>{certificate.title}</Typography>
                            <Typography>Issuer : {certificate.issuerName}</Typography>
                            <Typography>Roll number : {certificate.rollNumber}</Typography>
                        </Card>
                    </Col>
                ))}
            </Row>
        </div>
    );
};

export default ViewAllCertificates;

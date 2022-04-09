import React, { useState, useEffect } from "react";
import { Card, Button, Row, Col, Typography, Modal, Layout } from "antd";
import { EyeOutlined } from "@ant-design/icons";

const ViewAllCertificates = ({ certStoreContract, certContract, user }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [content, setContent] = useState();

  useEffect(() => {
    console.log(certStoreContract);
    createReq();
  }, []);

  const createReq = async () => {
    const req = await certStoreContract.methods
      .requestCert("0xD3570FC765d397b63dEEf89d389c3344dA18ca52")
      .send({ from: user.walletAddress });
  };

  const certificates = [
    {
      name: "Puah Jia Qi",
      nric: "G1788294R",
      matricNo: "A0185811A",
      title: "Bachelor’s Degree in Information Systems",
      rollNumber: "123ggtsds8hd",
      completionDate: "20/6/2022",
      issuerName: "National University of Singapore",
    },
    {
      name: "Puah Jia Qi",
      nric: "G1788294R",
      matricNo: "A0185811A",
      title: "Bachelor’s Degree in Information Systems",
      rollNumber: "123ggtsds8hd",
      completionDate: "20/6/2022",
      issuerName: "National University of Singapore",
    },
    {
      name: "Puah Jia Qi",
      nric: "G1788294R",
      matricNo: "A0185811A",
      title: "Diploma in Computer Engineering",
      rollNumber: "12dhdwedied8j32",
      completionDate: "20/6/2017",
      issuerName: "Singapore Polytechnic",
    },
    {
      name: "Puah Jia Qi",
      nric: "G1788294R",
      matricNo: "A0185811A",
      title: "Master of Business Administration",
      rollNumber: "cndjk123kbhjqw",
      completionDate: "20/6/2026",
      issuerName: "Nanyang Technological Unversity",
    },
  ];

  const showModal = (certificate) => {
    console.log(certificate);
    setIsModalVisible(true);
    setContent(certificate);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setContent();
  };

  return (
    <div>
      <Typography.Title level={2} style={{ paddingLeft: 20, paddingTop: 20 }}>
        Digital Certificate
      </Typography.Title>

      <Row type="flex" justify="space-around" align="middle">
        {certificates.map((certificate) => (
          <Col style={{ paddingTop: "10px" }}>
            <Card
              style={{ width: "350px" }}
              actions={[
                <Button
                  onClick={() => showModal(certificate)}
                  icon={<EyeOutlined />}
                >
                  View Certificate
                </Button>,
              ]}
            >
              <Typography>{certificate.title}</Typography>
              <Typography>Issuer : {certificate.issuerName}</Typography>
              <Typography>Roll number : {certificate.rollNumber}</Typography>
              <Modal
                centered={true}
                visible={isModalVisible}
                footer={null}
                onCancel={handleCancel}
                bodyStyle={{ height: 550 }}
              >
                {content && (
                  <div>
                    <Row
                      style={{
                        height: 150,
                        textAlign: "center",
                      }}
                      align="middle"
                    >
                      <Typography.Title>{content.issuerName}</Typography.Title>
                    </Row>
                    <Row
                      style={{
                        height: 50,
                        textAlign: "center",
                      }}
                      align="middle"
                    >
                      <Typography>This is to confirm that</Typography>
                    </Row>
                    <Row style={{ height: 50, textAlign: "center" }}>
                      <Typography.Title level={3}>
                        {content.name}
                      </Typography.Title>
                    </Row>
                    <Row style={{ height: 50, textAlign: "center" }}>
                      <Typography>
                        has successfully completed the program:
                      </Typography>
                    </Row>
                    <Row style={{ height: 50, textAlign: "center" }}>
                      <Typography.Title level={3}>
                        {content.title}
                      </Typography.Title>
                    </Row>
                    <Row style={{ height: 50, textAlign: "center" }}>
                      <Typography>{content.completionDate}</Typography>
                    </Row>
                    <Row style={{ height: 50, textAlign: "center" }}>
                      <Typography>{content.matricNo}</Typography>
                    </Row>
                    <Row style={{ height: 50, textAlign: "center" }}>
                      <Typography>Roll Number: {content.rollNumber}</Typography>
                    </Row>
                  </div>
                )}
              </Modal>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default ViewAllCertificates;

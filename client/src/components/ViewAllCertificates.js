import React, { useState, useEffect } from "react";
import { Card, Button, Row, Col, Typography, Modal, Layout, Space } from "antd";
import { EyeOutlined } from "@ant-design/icons";

const ViewAllCertificates = ({ certStoreContract, certContract, user,accounts }) => {

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [certificates, setCertificates] = useState([]);
  const [certificate, setCertificate] = useState({issueName:'',title:'', completionDate:'',nric:'',serialNo:''
});

  useEffect(() => {
    getCertificate();
  }, []);

  const getCertificate = async () => {
    const cert = await certContract.methods.getCerts().call({ from: accounts[0] });
      setCertificates(cert);
      console.log(cert);
  };


  const showModal = (cert) => {
    setIsModalVisible(true);
    setCertificate(cert);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setCertificate({issueName:'',title:'',completionDate:'',nric:'',serialNo:''
  });
  };

  return (
    <div>
      <Typography.Title level={2} style={{ paddingLeft: 20, paddingTop: 20 }}>
        Digital Certificate
      </Typography.Title>

      <Row type="flex" justify="space-around" align="middle">
        {certificates.map((cert) => (
          <Col style={{ paddingTop: "10px" }}>
            <Card
              style={{ width: "350px" }}
              actions={[
                <Button
                  onClick={() => showModal(cert)}
                  icon={<EyeOutlined />}
                >
                  View Certificate
                </Button>,
              ]}
            >
              <Typography>{cert.title}</Typography>
              <Typography>Issuer : {cert.issuerName}</Typography>
              <Typography>Roll number : {cert.serialNo}</Typography>
              <Modal
                centered={true}
                visible={isModalVisible}
                footer={null}
                onCancel={handleCancel}
                bodyStyle={{ height: 550 }}
              >
                  <div>
                      <Space direction="horizontal" style={{height: 100,width: '100%', justifyContent: 'center'}}>
                        <Typography.Title>
                          {certificate.issuerName}
                        </Typography.Title>
                      </Space>
                      <Space direction="horizontal" style={{height: 50,width: '100%', justifyContent: 'center'}}>
                        <Typography>This is to confirm that</Typography>
                      </Space>           
                    <Space direction="horizontal" style={{height: 50,width: '100%', justifyContent: 'center'}}>
                      <Typography.Title level={3}>
                        {user.name}
                      </Typography.Title>
                    </Space>
                    <Space direction="horizontal" style={{height: 50,width: '100%', justifyContent: 'center'}}>
                      <Typography>
                        has successfully completed the program:
                      </Typography>
                    </Space>
                    <Space direction="horizontal" style={{height: 50,width: '100%', justifyContent: 'center'}}>
                      <Typography.Title level={3}>
                        {certificate.title}
                      </Typography.Title>
                    </Space>
                    <Space direction="horizontal" style={{height: 50,width: '100%', justifyContent: 'center'}}>
                      <Typography>{cert.completionDate}</Typography>
                    </Space>
                    <Space direction="horizontal" style={{height: 50,width: '100%', justifyContent: 'center'}}>
                      <Typography>{cert.nric}</Typography>
                    </Space>
                    <Space direction="horizontal" style={{height: 50,width: '100%', justifyContent: 'center'}}>
                      <Typography>Serial Number: {cert.serialNo}</Typography>
                    </Space>
                  </div>
              </Modal>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default ViewAllCertificates;

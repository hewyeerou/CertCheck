import React, { useEffect, useState } from "react";
import { getUserByAddress } from "../../models/User";
import { Card, Button, Row, Col, Typography, Modal, Table } from "antd";
import { EyeOutlined } from "@ant-design/icons";

function ViewCertVer({ user, certStoreContract, certContract, accounts }) {
  const [isViewCertModalVisible, setIsViewCertModalVisible] = useState(false);
  const [certificateViewingRight, setCertificateViewingRight] = useState();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [content, setContent] = useState();
  const [certificates, setCertificates] = useState();

  const columns = [
    { title: "Student Name", dataIndex: "name", key: "name" },
    {
      title: "Action",
      key: "action",
      render: (text, record) => (
        <Button
          onClick={() => {
            getStudentCerts(text);
            showViewCertModal();
          }}
        >
          View
        </Button>
      ),
    },
  ];

  const getStudents = async () => {
    let studentsDetail = [];
    let students = await certStoreContract.methods.getGrantList().call({ from: accounts[0] });

    // check the status of grant
    for (let i = 0; i < students.length; i++) {
      const rights = await certStoreContract.methods.checkGrantStatus(students[i]).call({ from: accounts[0] });

      if (rights === true) {
        await getUserByAddress(students[i]).then((user) => {
          studentsDetail.push(user);
        });
      }
    }

    studentsDetail = studentsDetail.map((r, index) => ({...r,key: index + 1,}));
    setCertificateViewingRight(studentsDetail);
  };

  /* get all student certs */
  const getStudentCerts = async (student) => {
    const allStudentCerts = await certContract.methods.getCertListVerifiers(student.walletAddress).call({ from: accounts[0] });
    let studentCertsDetail = [];

    for (var i = 0; i < allStudentCerts.length; i++) {
      await getUserByAddress(allStudentCerts[i].owner).then((user) => {
        if (user) {
          studentCertsDetail.push({
            certId: allStudentCerts[i].certId,
            completionDate: allStudentCerts[i].completionDate,
            name: user.name,
            email: user.email,
            creationDate: allStudentCerts[i].creationDate,
            nric: allStudentCerts[i].nric,
            walletAddress: allStudentCerts[i].owner,
            title: allStudentCerts[i].title,
            serialNo: allStudentCerts[i].serialNo,
            issuerName: allStudentCerts[i].issuerName,
          });
        }
      });
    }

    setCertificates(studentCertsDetail);
  };

  useEffect(() => {
    getStudents();
  }, []);

  const showViewCertModal = () => {
    setIsViewCertModalVisible(true);
  };

  const handleOk = () => {
    setIsViewCertModalVisible(false);
  };

  const handleCancel = () => {
    setIsViewCertModalVisible(false);
  };

  const showModal = (certificate) => {
    setIsModalVisible(true);
    setContent(certificate);
  };

  const handleViewDetailsCancel = () => {
    setIsModalVisible(false);
    setContent({ name: "" });
  };

  return (
    <>
      <Modal
        title="Digital Certificate"
        visible={isViewCertModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={null}
      >
        <Row type="flex" justify="space-around" align="middle">
          {certificates && certificates.map((certificate) => (
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
                <Typography>Serial number : {certificate.serialNo}</Typography>
                <Modal
                  centered={true}
                  visible={isModalVisible}
                  footer={null}
                  onCancel={handleViewDetailsCancel}
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
                        <Typography.Title>
                          {content.issuerName}
                        </Typography.Title>
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
                        <Typography>{content.nric}</Typography>
                      </Row>
                      <Row style={{ height: 50, textAlign: "center" }}>
                        <Typography>
                          Serial Number: {content.serialNo}
                        </Typography>
                      </Row>
                    </div>
                  )}
                </Modal>
              </Card>
            </Col>
          ))}
        </Row>
      </Modal>

      <Table columns={columns} dataSource={certificateViewingRight}></Table>
    </>
  );
}

export default ViewCertVer;

import React, { useEffect, useState } from "react";
import { Table, Button, Modal } from "antd";
import ViewAllCertificates from "../ViewAllCertificates";
import { getUserByAddress } from "../../models/User";


function ViewCertVer({ user, certContract, accounts }) {
  const [isViewCertModalVisible, setIsViewCertModalVisible] = useState(false);
  const [certificateViewingRight, setCertificateViewingRight] = useState();

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
    let students = await certContract.methods.getGrantList().call({ from: accounts[0] });

    for (let i = 0; i < students.length; i++) {
      const rights = await certContract.methods.checkSubject(students[i]).call({ from: accounts[0] });

      if (rights === true) {
        await getUserByAddress(students[i]).then((user) => {
          studentsDetail.push(user);
        });
      }
    }

    studentsDetail = studentsDetail.map((r, index) => ({...r, key: index+1}));
    setCertificateViewingRight(studentsDetail);
  };

  /* NOT COMPLETE */
  const getStudentCerts = async (student) => {
    let certIdsList = await certContract.methods.getCertListVerifiers(student.walletAddress).call({ from: accounts[0] });
    // make sure solidity has a method to return all cert
    // loop through each of the certid to find
    // and display
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

  return (
    <>
      <Modal
        title="Digital Certificate"
        visible={isViewCertModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={null}
      >
        <ViewAllCertificates user={user} />
      </Modal>

      <Table columns={columns} dataSource={certificateViewingRight}></Table>
    </>
  );
}

export default ViewCertVer;

pragma solidity >=0.5.0;

// Ref: https://github.com/TruSet/bitmask-rbac

contract CertificateNetwork {
    struct user {
        string role;
        // can add more variables
        // name
    }

    mapping(address => user) private userMap;
    mapping(address => bool) private userExistMap;
    mapping(string => uint256) userCountsByRole;

    event Register(address newAddress, string role);
    event RoleRemoved(address addr, string role);

    constructor() public {}

    function register(address newUserAddress, string memory newRole) public {
        require(
            !userExistMap[newUserAddress],
            "User already registered in system."
        );
        user memory newUser = user("");
        string memory role;
        if (
            keccak256(abi.encodePacked((newRole))) ==
            keccak256(abi.encodePacked(("Issuer")))
        ) {
            newUser.role = "Issuer";
            role = "Issuer";
            userCountsByRole[newRole]++;
        } else if (
            keccak256(abi.encodePacked((newRole))) ==
            keccak256(abi.encodePacked(("Subject")))
        ) {
            newUser.role = "Subject";
            role = "Subject";
            userCountsByRole[newRole]++;
        } else if (
            keccak256(abi.encodePacked((newRole))) ==
            keccak256(abi.encodePacked(("Verifier")))
        ) {
            newUser.role = "Verifier";
            role = "Verifier";
            userCountsByRole[newRole]++;
        } else {
            revert("Role does not exist");
        }
        userExistMap[newUserAddress] = true;
        userMap[newUserAddress] = newUser;
        emit Register(newUserAddress, role);
    }

    function checkUserExist(address checkAddress, string memory userRole)
        public
        view
        returns (bool)
    {
        require(userExistMap[checkAddress], "User not registered in system.");
        if (
            keccak256(abi.encodePacked((userMap[checkAddress].role))) ==
            keccak256(abi.encodePacked((userRole)))
        ) {
            return true;
        } else {
            return false;
        }
    }

    function getUserRole(address checkAddress)
        public
        view
        returns (string memory)
    {
        require(userExistMap[checkAddress], "User not registered in system.");
        return userMap[checkAddress].role;
    }
}

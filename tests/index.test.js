const axios = require("axios");

function sum(a, b) {
    return a + b;
}

const BACKEND_URL = "https://localhost:3000";

describe("Authentication", () => {
    test("User is able to signup", async () => {
        const username = "Raveesh" + Math.random();
        const password = "12345";

        const response = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            username,
            password,
            type: "admin",
        });

        expect(response.status).toBe(200);

        const updatedresponse = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            username,
            password,
            type: "admin",
        });
        expect(updatedresponse.status).toBe(400);
    });

    test("Signup fails because the username is empty", async () => {
        const username = "";
        const password = "123456";

        const response = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            username,
            password,
        });

        expect(response.status).toBe(400);
    });

    test("Signin succeeds if the username and password are correct", async () => {
        const username = `Raveesh-${Math.random()}`;
        const password = "12345";

        await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            username,
            password,
        });

        const response = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
            username,
            password,
        });
        expect(response.status).toBe(200);
        expect(response.data.token).toBeDefined();
    });

    test("Signin fails if the username and password are incorrect", async() => {
        const username = `Raveesh-${Math.random}`
        const password = '12345'

        await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            username,
            password
        })

        const response = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
            username: "WrongUsername",
            password: "WrongPassword",
        })

        expect(response.statuscode).toBe(403)

    })
});


describe("User Metadata Endpoints", () =>{

    let token = ""
    let avatarID = "";
    beforeAll(async () =>{
        const username = `Raveesh-${Math.random()}`
        const password = '12345'

        await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            username,
            password,
            type: "admin",
        });

        const response = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
            username,
            password,
            
        })

        token = response.data.token
        
        const avatarResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/avatar`,
        {
            "imageUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s",
            "name": "Timmy"
        })


        avatarID = avatarResponse.data.avatarID 
    })
    
    test("User can't update thier metadata with a wrong avatarID", async() => {
        const response = await axios.post(`${BACKEND_URL}/api/v1/user/metadata`, {
            avatarID : avatarID,
        },{
            headers:{
                "authorization" : `Bearer ${token}`
            }
        })
        expect(response.statuscode.toBe(400))
    });
    test("User can update thier metadata with the correct avatarID", async() => {
        const response = await axios.post(`${BACKEND_URL}/api/v1/user/metadata`, {
            avatarID : avatarID,
        },{
            headers:{
                "authorization" : `Bearer ${token}`
            }
    })
    expect(response.statuscode.toBe(200))
    });

    test("User is not able to update thier metadata if the auth header is not present", async() => {
        const response = await axios.post(`${BACKEND_URL}/api/v1/user/metadata`, {
            avatarID : avatarID,
        },{
            headers:{
                "authorization" : `Bearer ${token}`
            }
    })
    expect(response.statuscode.toBe(403))
});
});



describe("User avatar information", () =>{
    let avatarID;
    let token;
    let userId;
    beforeAll(async () =>{
        const username = `Raveesh-${Math.random()}`
        const password = '12345'

        const signupResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            username,
            password,
            type: "admin",
        });
        userId = signupResponse.data.userid

        const response = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
            username,
            password,
            
        })

        token = response.data.token
        
        const avatarResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/avatar`,
        {
            "imageUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s",
            "name": "Timmy"
        })


        avatarID = avatarResponse.data.avatarID 
    })
    
    test("Get back avatar information from a user", async() =>{
        const response = await axios.get(`${BACKEND_URL}/api/v1/user/metadata/bulk?ids = [${userId}]`);

        expect(response.data.avatarlength.toBe(1));
        expect(response.data.avatars[0].userId).toBe(userId);
    })

    test("Available avatars lists that recently created avatar", async() =>{
        const response = await axios.post(`${BACKEND_URL}/api/v1/avatars`);
        expect(response.data.avatars.lenght).not.toBe(0);
        const currentAvatar = response.data.avatars.find(x => x.id == avatarID);
        expect(currentAvatar).toBeDefined();
    })
        
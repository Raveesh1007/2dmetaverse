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
});


describe("Space information", () =>{
    let mapId;
    let element1Id;
    let element2Id;
    let token;
    let userId;
    let adminID;
    let adminToken;

    beforeAll(async () => {
        const username = `Raveesh-${Math.random()}`
        const password = '12345'

        const signupResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            username,
            password,
            type: "admin",
        });

        adminID = signupResponse.data.userid

        const response = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
            username,
            password,
            
        })

        adminToken = response.data.token

        const userSignupResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            username,
            password,
            type: "admin",
        });

        userId = userSignupResponse.data.userid

        const userSigninResponse = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
            username,
            password,
            
        })

        userToken = userSigninResponse.data.token

        const element1Id = await axios.post(`${BACKEND_URL}/api/v1/admin/element`,{
            "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
            "width": 1,
            "height": 1,
            "static": true // weather or not the user can sit on top of this element (is it considered as a collission or not)
        },{
            headers :{
                authorization: `Bearer ${adminToken}`
            }
        })

        const element2Id = await axios.post(`${BACKEND_URL}/api/v1/admin/element`,{
            "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
            "width": 1,
            "height": 1,
            "static": true // weather or not the user can sit on top of this element (is it considered as a collission or not)
        },{
            headers :{
                authorization: `Bearer ${adminToken}`
            }
        })

        element1Id = element1Id.id
        element2Id = element2Id.id

        const map = await axios.post(`${BACKEND_URL}/api/v1/admin/map`, {
            "thumbnail": "https://thumbnail.com/a.png",
            "dimensions": "100x200",
            "name": "100 person interview room",
            "defaultElements": [{
                    elementId: element1Id,
                    x: 20,
                    y: 20
                }, {
                  elementId: element1Id,
                    x: 18,
                    y: 20
                }, {
                  elementId: element2Id,
                    x: 19,
                    y: 20
                }, {
                  elementId: element2Id,
                    x: 19,
                    y: 20
                }
            ]
         }, {
            headers: {
                authorization: `Bearer ${token}`
            }
        });
        mapId = map.id
    })

    test("User is able to create a space", async() =>{
        const response = await axios.post(`${BACKEND_URL}/api/v1/space`,{
            "name" : "Test",
            "Dimensions" : "100x200",
            "mapId" : mapId
        }, {
            headers: {
                authorization: `Bearer ${userToken}`
            }
        })
        expect(response.spaceId).toBeDefined();
    })
    test("User is able to create a space without mapId (empty space)", async() =>{
        const response = await axios.post(`${BACKEND_URL}/api/v1/space`,{
            "name" : "Test",
            "Dimensions" : "100x200",
        }, {
            headers: {
                authorization: `Bearer ${userToken}`
            }
        })
        expect(response.spaceId).toBeDefined();
    })
    test("User is not able to create a space without mapId and dimensions", async() =>{
        const response = await axios.post(`${BACKEND_URL}/api/v1/space`,{
            "name" : "Test",
        }, {
            headers: {
                authorization: `Bearer ${userToken}`
            }
        })
     expect(response.statuscode).toBe(400);
    })


    test("User is not able to delete a space that doesn't exist", async() =>{
        const response = await axios.delete(`${BACKEND_URL}/api/v1/space/randomIdDoesntExist`)
        
        expect(response.statuscode).toBe(400);
    }, {
        headers: {
            authorization: `Bearer ${userToken}`
        }
    })

    test("User is able to delete a space that does exist", async() =>{
        const response = await axios.delete(`${BACKEND_URL}/api/v1/space`,{
            "name" : "Test",
            "dimension" : "100x200"
        }, {
            headers: {
                authorization: `Bearer ${userToken}`
            }
        })

        const deleteResponse = await axios.delete(`${BACKEND_URL}/api/v1/space/${response.data.spaceId}`)
        
        expect(deleteResponse.statuscode).toBe(200);
    })

    test("User should not be able to delete the space of another user", async() =>{
        const response = await axios.delete(`${BACKEND_URL}/api/v1/space/all`,{
            "name" : "Test",
            "dimension" : "100x200"
        }, {
            headers: {
                authorization: `Bearer ${userToken}`
            }
        })

        const deleteResponse = await axios.delete(`${BACKEND_URL}/api/v1/space/${response.data.spaceId}`,{
            headers: {
                authorization: `Bearer ${adminToken}`
            }
        })
        
        expect(deleteResponse.statuscode).toBe(400);
    })

    test("Admin has no spaces initially", async() =>{
        const spaceCreateResponse = await axios.post(`${BACKEND_URL}/api/v1/space/all`,{
            "name" : "Test",
            "dimension" : "100x200"
        }, {
            headers: {
                authorization: `Bearer ${userToken}`
            }
        })

        const response = await axios.delete(`${BACKEND_URL}/api/v1/space/${response.data.spaceId}`);
        const filteredSpace = response.data.spaces.find(x => x.id ==spaceCreateResponse.spaceId)
        expect(response.data.spaces.length).toBe(0)
        expect(filteredSpace).toBeDefined()
    })
})


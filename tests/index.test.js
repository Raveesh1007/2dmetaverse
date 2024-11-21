const axios = require("axios");

function sum(a, b) {
    return a + b;
}

const BACKEND_URL = "https://localhost:3000";
const WS_URL = "ws://localhost:3001"

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
        },{
            headers: {
                "authorization" : `Bearer${userToken}` 
            }
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
        },{
            headers: {
                "authorization" : `Bearer${token}`
            }
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
        expect(response.data.avatars.length).not.toBe(0);
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
            username: username + "-user",
            password,
            type: "user",
        });

        userId = userSignupResponse.data.userid

        const userSigninResponse = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
            username: username + "-user",
            password,
            
        })

        userToken = userSigninResponse.data.token

        const element1Response = await axios.post(`${BACKEND_URL}/api/v1/admin/element`,{
            "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
            "width": 1,
            "height": 1,
            "static": true // weather or not the user can sit on top of this element (is it considered as a collission or not)
        },{
            headers :{
                authorization: `Bearer ${adminToken}`
            }
        })

        const element2Response = await axios.post(`${BACKEND_URL}/api/v1/admin/element`,{
            "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
            "width": 1,
            "height": 1,
            "static": true // weather or not the user can sit on top of this element (is it considered as a collission or not)
        },{
            headers :{
                authorization: `Bearer ${adminToken}`
            }
        })

        element1Id = element1Response.data.id
        element2Id = element2Response.data.id

        const mapResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/map`, {
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
        mapId = mapResponse.id
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
        expect(response.data.spaceId).toBeDefined();
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


describe("Arena endpoints", () =>{
    let mapId;
    let element1Id;
    let element2Id;
    let token;
    let userId;
    let adminID;
    let adminToken;
    let spaceId;

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
            username: username + "-user",
            password,
            
        })

        adminToken = response.data.token

        const userSignupResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            username,
            password,
            type: "user",
        });

        userId = userSignupResponse.data.userid

        const userSigninResponse = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
            username : username + "-user",
            password,
            
        })

        userToken = userSigninResponse.data.token

        const element1Response = await axios.post(`${BACKEND_URL}/api/v1/admin/element`,{
            "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
            "width": 1,
            "height": 1,
            "static": true // weather or not the user can sit on top of this element (is it considered as a collission or not)
        },{
            headers :{
                authorization: `Bearer ${adminToken}`
            }
        })

        const element2Response = await axios.post(`${BACKEND_URL}/api/v1/admin/element`,{
            "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
            "width": 1,
            "height": 1,
            "static": true // weather or not the user can sit on top of this element (is it considered as a collission or not)
        },{
            headers :{
                authorization: `Bearer ${adminToken}`
            }
        })

        element1Id = element1Response.data.id
        element2Id = element2Response.data.id

        const mapResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/map`, {
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
        mapId = mapResponse.id

        const spaceResponse = await axios.post(`${BACKEND_URL}/api/v1/`,{
            "name": "Test",
            "dimensions" : "100x200",
            "mapId" : mapId
        },{
            headers : {
                "authorization" : `Bearer ${userToken}` 
            }})
        spaceId : spaceResponse.data.spaceId
    });
    
    
    test("Incorrect space Id returns a 400", async() =>{
        const response = await axios.get(`${BACKEND_URL}/api/v1/space/123kasdk01`,{
            headers:{
                "authorization" : `Bearer${userToken}`
            }
        });
        expect(response.statuscode).toBe(400)
    })


    test("Correct space Id returns all elements", async() =>{
        const response = await axios.get(`${BACKEND_URL}/api/v1/space/${spaceId}`);
        expect(response.data.Dimensions).toBe("100x200");
        expect(response.data.elemnets.length).toBe(3);
    })


    test("Delete endpoints is able to delete an element", async() =>{
        const response = await axios.get(`${BACKEND_URL}/api/v1/space/${spaceId}`);
        await axios.delete(`${BACKEND_URL}/api/v1/space/element`, {
            spaceId : spaceId,
            elementId : response.data.elemnets[0].id
        },{
            headers:{
                "authorization" : `Bearer${userToken}`
            }
        });

        const newResponse = await axios.get(`${BACKEND_URL}/api/v1/space/${spaceId}`,{
            headers:{
                "authorization" : `Bearer${userToken}`
            }
        });
        expect(response.data.Dimensions).toBe("100x200");
        expect(newResponse.data.elemnets.length).toBe(2);
    })

    test("Adding an element works as expected", async() =>{
        await axios.post(`${BACKEND_URL}/api/v1/space/element`, {
            "elementId": element1Id,
            "spaceId": spaceId,
            "x": 50,
            "y": 20
          },{
            headers:{
                "authorization" : `Bearer${userToken}`
            }
        });

        const newResponse = await axios.get(`${BACKEND_URL}/api/v1/space/${spaceId}`,{
            headers:{
                "authorization" : `Bearer${userToken}`
            }
        });
        expect(newResponse.data.elemnets.length).toBe(3);
    })
    
    test("Adding an element fails if it lies outside the dimensions", async() =>{
        await axios.post(`${BACKEND_URL}/api/v1/space/${spaceId}`);
        await axios.delete(`${BACKEND_URL}/api/v1/space/element`, {
            "elementId": element1Id,
            "spaceId": spaceId,
            "x": 10000,
            "y": 20000
          },{
            headers:{
                "authorization" : `Bearer${userToken}`
            }
        });

        const Response = await axios.get(`${BACKEND_URL}/api/v1/space/${spaceId}`);
        expect(Response.statuscode).toBe(404);
    })
})

describe("Admin endpoints", () => {

    let userToken;
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
            username: username + "-user",
            password,
            
        })

        adminToken = response.data.token

        const userSignupResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            username,
            password,
            type: "user",
        });

        userId = userSignupResponse.data.userid

        const userSigninResponse = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
            username : username + "-user",
            password,
            
        })

        userToken = userSigninResponse.data.token
    });

    test("User is not able to hit an Endpoints" ,async () => {
        const element1Response = await axios.post(`${BACKEND_URL}/api/v1/admin/element`,{
            "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
            "width": 1,
            "height": 1,
            "static": true // weather or not the user can sit on top of this element (is it considered as a collission or not)
        },{
            headers :{
                authorization: `Bearer ${userToken}`
            }
        }) 
        expect(element1Response.statuscode).tobe(403)
 

        const mapResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/map`, {
            "thumbnail": "https://thumbnail.com/a.png",
            "dimensions": "100x200",
            "name": "100 person interview room",
            "defaultElements": []
         }, {
            headers: {
                authorization: `Bearer ${userToken}`
            }
        })
        const avatarResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/avatar`,
            {
                "imageUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s",
                "name": "Timmy"
            },{
                headers: {
                    "authorization" : `Bearer${userToken}` 
                }
            })


            const updateElementResponse = await axios.put(`${BACKEND_URL}/api/v1/admin/element/123`,
                {
                    "imageUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s",
                    "name": "Timmy"
                },{
                    headers: {
                        "authorization" : `Bearer${userToken}` 
                    }
                }) 


        expect(element1Response.statuscode).tobe(403)
        expect(mapResponse.statuscode).tobe(403)
        expect(avatarResponse.statuscode).toBe(403)
        expect(updateElementResponse.statuscode).toBe(403)
    })

    test("User is not able to hit an Endpoints" ,async () => {
        const element1Response = await axios.post(`${BACKEND_URL}/api/v1/admin/element`,{
            "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
            "width": 1,
            "height": 1,
            "static": true // weather or not the user can sit on top of this element (is it considered as a collission or not)
        },{
            headers :{
                authorization: `Bearer ${adminToken}`
            }
        }) 
        expect(element1Response.statuscode).tobe(403)
 

        const mapResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/map`, {
            "thumbnail": "https://thumbnail.com/a.png",
            "dimensions": "100x200",
            "name": "100 person interview room",
            "defaultElements": []
         }, {
            headers: {
                authorization: `Bearer ${adminToken}`
            }
        })
        const avatarResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/avatar`,
            {
                "imageUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s",
                "name": "Timmy"
            },{
                headers: {
                    "authorization" : `Bearer${adminToken}` 
                }
            })


        expect(element1Response.statuscode).tobe(200)
        expect(mapResponse.statuscode).tobe(200)
        expect(avatarResponse.statuscode).toBe(200)
        
    })

    test("Admin is able to update the imageUrl for an element", async() => {

        const elementResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/element`,{
            "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
            "width": 1,
            "height": 1,
            "static": true // weather or not the user can sit on top of this element (is it considered as a collission or not)
        },{
            headers :{
                authorization: `Bearer ${adminToken}`
            }
        })
        const updateElementResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/element/${elementResponse.data.id}`,{
            "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
            "width": 1,
            "height": 1,
            "static": true // weather or not the user can sit on top of this element (is it considered as a collission or not)
        },{
            headers :{
                authorization: `Bearer ${adminToken}`
            }
        })
        expect(updateElementResponse.statuscode).toBe(200)
    })
})



describe("WebSockets" , () => {
    let adminToken;
    let adminUserID;
    let userToken;
    let userid;
    let mapId;
    let element1Id;
    let element2Id;
    let spaceId;
    let ws1;
    let ws2
    let ws1Messages = [];
    let ws2Messages = [];
    let userX;
    let userY;
    let adminX;
    let adminY;

    function WaitForAndPopLatestMessage(MessageArray) {
        return new Promise(r =>{
            if(MessageArray.length > 0){
                resolve(MessageArray.shift())
            }else{
                let interval = setInterval(() =>{
                    if(MessageArray.length > 0){
                    resolve(MessageArray.shift())
                    clearInterval(interval)
                    }
                })
            }
        })
    }

    async function setupHTTP(){

        const username = `Raveesh-${Math.random()}`
        const password = "123456"
        const adminSignupResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            username,
            password,
            role: "admin"
        })
        const adminSigninResponse = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
            username,
            password
        })
        adminUserID = adminSignupResponse.data.userid
        adminToken = adminSigninResponse.data.token

        const userSignupResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            username: username + `-user`,
            password,
        })

        const userSigninResponse = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
            username: username + `-user`,
            password
        })

        userid = userSignupResponse.data.userid
        userToken = userSigninResponse.data.token

        const element1Response = await axios.post(`${BACKEND_URL}/api/v1/admin/element`,{
            "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
            "width": 1,
            "height": 1,
            "static": true // weather or not the user can sit on top of this element (is it considered as a collission or not)
        },{
            headers :{
                authorization: `Bearer ${adminToken}`
            }
        })

        const element2Response = await axios.post(`${BACKEND_URL}/api/v1/admin/element`,{
            "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
            "width": 1,
            "height": 1,
            "static": true // weather or not the user can sit on top of this element (is it considered as a collission or not)
        },{
            headers :{
                authorization: `Bearer ${adminToken}`
            }
        })

        element1Id = element1Response.data.id
        element2Id = element2Response.data.id

        const mapResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/map`, {
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
        mapId = mapResponse.id

        const spaceResponse = await axios.post(`${BACKEND_URL}/api/v1/`,{
            "name": "Test",
            "dimensions" : "100x200",
            "mapId" : mapId
        },{
            headers : {
                "authorization" : `Bearer ${userToken}` 
            }})
            console.log(spaceResponse.status)
        spaceId : spaceResponse.data.spaceId
    }

    async function setupws(){
        ws1 = new WebSocket(WS_URL);
        ws2 = new WebSocket(WS_URL);

        await new Promise(r =>{
            ws1.onopen = r
        })

        await new Promise(r =>{
            ws2.onopen = r
        })
        ws1.onmessage = (event) =>{
            ws1Messages.push(JSON.parse(event.data))
        }
        ws2.onmessage = (event) =>{
            ws2Messages.push(JSON.parse(event.data))
        }

        ws1.send(JSON.strigify({
            "type": "join",
            "payload": {
                "spaceId": spaceId,
                "token": adminToken
            }
        }))

        ws2.send(JSON.strigify({
            "type": "join",
            "payload": {
                "spaceId": spaceId,
                "token": userToken
            }
        }))
    }


    beforeAll(async() =>{
        await setupHTTP()
        await setupws()
    })

    test("Get back acknowledgment for joining the space", async() =>{
        ws1.send(JSON.strigify({
            "type": "join",
            "payload": {
                "spaceId": spaceId,
                "token": adminToken
            }
        }))
        const message1 = await WaitForAndPopLatestMessage(ws1Messages);
        ws2.send(JSON.strigify({
            "type": "join",
            "payload": {
                "spaceId": spaceId,
                "token": userToken
            }
        }))
        console.log("insixe first test3")

        const message2 = await WaitForAndPopLatestMessage(ws2Messages);
        const message3 = await WaitForAndPopLatestMessage(ws1Messages);
        
        expect(message1.type).tobe("space-joined");
        expect(message2.type).tobe("space-joined");
        expect(message1.payload.users.length).tobe(0);
        expect(message2.payload.users.length).tobe(1)
        expect(message3.type).toBe("user-joined");
        expect(message3.payload.x).toBe(message2.payload.spawn.x);
        expect(message3.payload.y).toBe(message2.payload.spawn.y);
        expect(message3.payload.userId).toBe(userId);

        adminX = message1.payload.spawn.x
        adminY = message1.payload.spawn.y

        userX = message2.payload.spawn.x
        userY = message2.payload.spawn.y
    })
    
    test("User should not be able to move across the boundary of the wall", async() =>{
        ws1.send(JSON.strigify({
            "type": "move",
            "payload": {
                x: 1000000,
                y : 100000,
            }
        }));
        const message = await WaitForAndPopLatestMessage(ws1Messages);
        expect(message.type).toBe("movement-rejected");
        expect(message.payload.x).tobe(adminX)
        expect(message.payload.y).tobe(adminY) 
    })

    test("User should not be able to move two blocks at the same time" , async () =>{
        ws1.send(JSON.strigify({
            "type": "move",
            "payload": {
                x: adminX + 2,
                y: adminY,
            }
        }));

        const message = await WaitForAndPopLatestMessage(ws1Messages);
        expect(message.type).toBe("movement-rejected")
        expect(message.payload.x).toBe(adminX)
        expect(message.payload.y).toBe(adminY)
    })

    test("Correct movement should be broadcasted to the other sockets in the room",async () => {
        ws1.send(JSON.stringify({
            type: "move",
            payload: {
                x: adminX + 1,
                y: adminY,
                userId: adminId
            }
        }));

        const message = await WaitForAndPopLatestMessage(ws2Messages);
        expect(message.type).toBe("movement")
        expect(message.payload.x).toBe(adminX + 1)
        expect(message.payload.y).toBe(adminY)
    })

    test("If a user leaves, the other user receives a leave event", async () => {
        ws1.close()
        const message = await WaitForAndPopLatestMessage(ws2Messages);
        expect(message.type).toBe("user-left")
        expect(message.payload.userId).toBe(adminUserId)
    })
})


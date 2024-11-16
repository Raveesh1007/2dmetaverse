const axios = require("axios");

function sum(a, b) {
    return a + b;
}

const BACKEND_URL = "https://localhost:3000";

describe("Authentication", () => {
    test("User is able to signup", async () => {
        const username = "Raveesh" + Math.random();
        const password = "123456";

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
        const password = "123456";

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

        await axios.post()
    })
});

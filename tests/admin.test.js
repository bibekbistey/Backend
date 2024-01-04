const supertest = require("supertest");
const app = require("../server");
const api = supertest(app);
const User = require("../models/userModels");
const Doctor = require("../models/doctorModel");
const mongoose = require("mongoose");

beforeAll(async () => {
  await User.deleteMany({});
  await Doctor.deleteMany({});
});



let adminToken; // To store the token for admin authentication

beforeEach(async () => {

    await api.post("/api/v1/user/register").send({
        name:"Admin",
        email: "admin5@gmail.com",
        password:"admin"
        });
//   const adminUser = await User.create(testAdmin);
  const res = await api
    .post("/api/v1/user/login")
    .send({ email:"admin5@gmail.com", password: "admin" })
    .expect(200);
    adminToken = res.body.token;

  
});

// Test cases for getAllUsersController
test("get all users", async () => {
  // Create some test users
  await User.create({
    name: "User 1",
    email: "user1@example.com",
    password: "user123",
    isAdmin: false,
  });
  await User.create({
    name: "User 2",
    email: "user2@example.com",
    password: "user456",
    isAdmin: false,
  });

  const res = await api
    .get("/api/v1/admin/getAllUsers")
    .set("Authorization", `Bearer ${adminToken}`)
    
    .expect(200);
console.log(res.status, res.body);
  expect(res.body.success).toBe(true);
  expect(res.body.message).toBe("users data list");
  expect(res.body.data.length).toBe(3);
});


//get all users without admin authentication

test("get all users without admin authentication", async () => {
  const res = await api.get("/api/v1/admin/getAllUsers").expect(401);

});

// Test cases for getAllDoctorsController
test("get all doctors", async () => {
  // Create some test doctors
  await Doctor.create({
    firstName: "Jane",
    lastName: "Smith",
    phone: "9876543210",
    email: "jane@example.com",
    address: "456 Park Avenue",
    specialization: "Dermatology",
    experience: "3 years",
    feesPerCunsaltation: 150,
    timings: {        
        '09:00 AM':"10:00PM"
        
      // Add timings for other days as well...
    },
    // Other required fields...
  });
  await Doctor.create({
    firstName: "John",
    lastName: "Doe",
    phone: "1234567890",
    email: "john@example.com",
    address: "123 Main Street",
    specialization: "Cardiology",
    experience: "5 years",
    feesPerCunsaltation: 100,
    timings: {        
        '09:00 AM':"10:00PM"
        
      // Add timings for other days as well...
    },
  });

  const res = await api
    .get("/api/v1/admin/getAllDoctors")
    .set("Authorization", `Bearer ${adminToken}`)
    .expect(200);

  expect(res.body.success).toBe(true);
  expect(res.body.message).toBe("Doctors Data list");
  expect(res.body.data.length).toBe(2);
});



// Test cases for changeAccountStatusController
// test("change doctor account status", async () => {

//   // Create a test doctor
//   const testDoctor = await Doctor.create({
//     firstName: "John",
//     lastName: "Doe",
//     phone: "1234567890",
//     email: "john@example.com",
//     address: "123 Main Street",
//     specialization: "Cardiology",
//     experience: "5 years",
//     feesPerCunsaltation: 100,
//     timings: {
//       Monday: {
//         start: "09:00 AM",
//         end: "10:00 PM"
//       },
//       Tuesday: {
//         start: "09:00 AM",
//         end: "10:00 PM"
//       },
//       },
    
//   });

//   const res = await api
//     .post("/api/v1/admin/changeAccountStatus")
//     .set("Authorization", `Bearer ${adminToken}`)
//     .send({
//       doctorId: testDoctor._id,
//       status: "approved",
//     })
//     .expect(201);

//   expect(res.body.success).toBe(true);
//   expect(res.body.message).toBe("Account Status Updated");

//   const updatedDoctor = await Doctor.findById(testDoctor._id);
//   expect(updatedDoctor.status).toBe("approved");
// });



// Test cases for deleteUserController
test("delete user", async () => {
  // Create a test user
  const testUser = await User.create({
    name: "Test User",
    email: "testuser@example.com",
    password: "test123",
    isAdmin: false,
  });

  const res = await api
    .delete(`/api/v1/admin/deleteUsers/${testUser._id}`)
    .set("Authorization", `Bearer ${adminToken}`)
    .expect(200);

  expect(res.body.success).toBe(true);
  expect(res.body.message).toBe("User deleted successfully");

  const deletedUser = await User.findById(testUser._id);
  expect(deletedUser).toBeNull(); // User should not exist in the database
});

test("delete user without admin authentication", async () => {
  // Create a test user
  const testUser = await User.create({
    name: "Test User",
    email: "testuser1@example.com",
    password: "test123",
    isAdmin: false,
  });

  const res = await api
    .delete(`/api/v1/admin//deleteUsers/${testUser._id}`)
    .expect(401);

  // expect(res.body.message).toMatch(/Unauthorized/);

  const deletedUser = await User.findById(testUser._id);
  expect(deletedUser).not.toBeNull(); // User should still exist in the database
});

afterAll(async () => await mongoose.connection.close());

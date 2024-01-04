const supertest = require("supertest");

const app = require("../server");

const api = supertest(app);

const User = require("../models/userModels");

const mongoose = require("mongoose");
const Doctor = require("../models/doctorModel");
const Appointment = require("../models/appointmentModel");
let usertoken;
beforeAll(async () => {
  await User.deleteMany({});
  await Doctor.deleteMany({});
  await Appointment.deleteMany({});


  await api.post("/api/v1/user/register").send({
    name:"User5",
    email: "user10@gmail.com",
    password:"user"
    });

//   const adminUser = await User.create(testAdmin);
    const res = await api
    .post("/api/v1/user/login")
    .send({ email:"user10@gmail.com", password: "user" })
    .expect(200);
    userToken = res.body.token;
});

// test('should register a new user', () => {
//   return api.post('/api/v1/users/register')
//       .send({
//         name: "User",
//         email: "user@gmail.com",
//         password: "test123",
//       })
//       .then(res => {
//           // expect(res.body).toBeDefined()
//           expect(res.body.success).tobe(true)
//           // expect(res.body.user.role).toBe('user')
//       })
// })

test("user registration", async () => {
  const res = await api
    .post("/api/v1/user/register")
    .send({
      name: "User",
      email: "user@gmail.com",
      password: "test123",
    })
    .expect(201);

  // expect(res.body.status).toBe("success");
  expect(res.body.success).toBe(true);
  expect(res.body.message).toBe("Register Sucessfully");
});

test("registration with duplicate username", async () => {
  
  const res = await api
    .post("/api/v1/user/register")
    .send({
      name: "testUser",
      email: "user@gmail.com",
      password: "testUser",
    })
    .expect(200);
  // expect(res.body.error).toMatch(/Duplicate/);
  expect(res.body.success).toBe(false);
  expect(res.body.message).toMatch(/User Already Exist/);

});



// test("registration with valid email", async () => {
//   const res = await api
//     .post("/api/v1/user/register")
//     .send({
//       name: "testUser2",
//       email:"test@gmailcom",
//       password: "testUser",
//     })
//     .expect(400);
//   expect(res.body.error).toMatch(/Please enter a valid email/);
// });

test("registrated user can login", async () => {
  const res = await api
    .post("/api/v1/user/login")
    .send({
      email: "user@gmail.com",
      password: "test123",
    })
    .expect(200);

  expect(res.body.token).toBeDefined();
});

test("user login with unregistered email", async () => {
  const res = await api
    .post("/api/v1/user/login")
    .send({
      email: "testuser@gmail.com",
      password: "test123",
    })
    .expect(200);

  expect(res.body.message).toBe("user not found");
});

test("user login with wrong password", async () => {
  const res = await api
    .post("/api/v1/user/login")
    .send({
      email: "user@gmail.com",
      password: "test12345",
    })
    .expect(200);
  expect(res.body.success).toBe(false);
  expect(res.body.message).toBe('Invalid Email or Password');
});



test('error handling in login controller', async () => {
  // Simulate an error condition by passing invalid data or causing an exception

  const res = await api
    .post('/api/v1/user/login')
    .send({ // Use an invalid email to trigger an error
      email:'bibek',
      password: 'test123',

    })
    .expect(200);

  // expect(res.body.message).toMatch(/Error in Login CTRL/);
});


test("get user data", async () => {
  const res = await api
    .post("/api/v1/user/getUserData")
    .set("Authorization", `Bearer ${userToken}`)
    // .send({ userId: testUser._id })
    .expect(200);

  expect(res.body.success).toBe(true);
  expect(res.body.data).toBeDefined();
  expect(res.body.data.name).toBe("User5");
  expect(res.body.data.email).toBe("user10@gmail.com");
});





test("apply for doctor account", async () => {
  const res = await api
    .post("/api/v1/user//apply-doctor")
    .set("Authorization", `Bearer ${userToken}`)
    .send({
      firstName: "John",
      lastName: "Doe",
      phone: "1234567890",
      email: "john.doe@example.com",
      website: "johndoe.com",
      address: "123 Main Street",
      specialization: "Cardiologist",
      experience: "5 years",
      feesPerCunsaltation: 200,
      timings: {
        "10:00 AM - 5:00 PM":
        "9:00 AM - 4:00 PM",
      },
    })
    .expect(201);
    console.log("Response Body:", res.body);
  expect(res.body.success).toBe(true);
  expect(res.body.message).toBe("Doctor Account Applied Successfully");
});


test("get all notifications", async () => {
  const res = await api
    .post("/api/v1/user/get-all-notification")
    .set("Authorization", `Bearer ${userToken}`)
    .expect(200);

  expect(res.body.success).toBe(true);
  expect(res.body.message).toBe("all notification marked as read");
  expect(res.body.data.notifcation.length).toBe(0);
  expect(res.body.data.seennotification.length).toBe(0);
});




test("delete all notifications", async () => {
  const res = await api
    .post("/api/v1/user/delete-all-notification")
    .set("Authorization", `Bearer ${userToken}`)
    .expect(200);

  expect(res.body.success).toBe(true);
  expect(res.body.message).toBe("Notifications Deleted successfully");
  expect(res.body.data.notifcation.length).toBe(0);
  expect(res.body.data.seennotification.length).toBe(0);
});


// test("get all doctors", async () => {
//   const res = await api
//     .get("/api/v1/user/getAllDoctors")
//     .set("Authorization", `Bearer ${userToken}`)
//     .expect(200);

//   expect(res.body.success).toBe(true);
//   expect(res.body.message).toBe("Docots Lists Fetched Successfully");
//   expect(res.body.data.length).toBeGreaterThan(0);
// });


test("get all doctors", async () => {
  // Create some test doctors
  await Doctor.create({
    firstName: "John",
    lastName: "Doe",
    phone: "1234567890",
    email: "john.doe@example.com",
    website: "johndoe.com",
    address: "123 Main St",
    specialization: "Cardiology",
    experience: "5 years",
    feesPerCunsaltation: 100,
    status: "approved",
    timings: {
      Monday: "10:00 AM - 5:00 PM",
        Tuesday: "9:00 AM - 4:00 PM",
      // Timings object here
    },
    qualification: "MBBS",
  });
  await Doctor.create({
    firstName: "Jane",
    lastName: "Smith",
    phone: "9876543210",
    email: "jane.smith@example.com",
    website: "janesmith.com",
    address: "456 Park Ave",
    specialization: "Dermatology",
    experience: "3 years",
    feesPerCunsaltation: 80,
    status: "approved",
    timings: {
      Monday: "10:00 AM - 5:00 PM",
        Tuesday: "9:00 AM - 4:00 PM",
      // Timings object here
    },
   
  });

  const res = await api
    .get("/api/v1/user/getAllDoctors")
    .set("Authorization", `Bearer ${userToken}`)
    .expect(200);

  expect(res.body.success).toBe(true);
  expect(res.body.message).toBe("Docots Lists Fetched Successfully");
  expect(res.body.data.length).toBeGreaterThan(0);
});




// test("book appointment", async () => {
//   const res = await api
//     .post("/api/v1/user/book-appointment")
//     .set("Authorization", `Bearer ${userToken}`)
//     .send({
//       doctorInfo: {
//         userId: "doctor_id_here",
//         // Other doctor related fields...
//       },
//       userInfo: {
//         name: "User5",
//         email: "user10@gmail.com",
//         // Other user related fields...
//       },
//       date: "01-08-2023",
//       time: "10:00",
//     })
//     .expect(200);

//   expect(res.body.success).toBe(true);
//   expect(res.body.message).toBe("Appointment Book successfully");
// });






test("book appointment", async () => {
  // Create a new user
  const userRes = await api
    .post("/api/v1/user/login")
    .send({
      name: "User5",
      email: "user10@gmail.com",
      password: "user",
    })
    console.log(userRes.body);
    // .expect(200);
    const userToken = userRes.body.token;

  // Get the user ID from the response
  const userId = userRes.body.data._id;

  // Create a new doctor
  const doctorRes = await api
    .post("/api/v1/user/apply-doctor")
    .set("Authorization", `Bearer ${userToken}`)
    .send({
      firstName: "John",
      lastName: "Doe",
      phone: "1234567890",
      email: "john.doe@example.com",
      website: "johndoe.com",
      address: "123 Main Street",
      specialization: "Cardiologist",
      experience: "5 years",
      feesPerCunsaltation: 200,
      timings: {
        "10:00 AM - 5:00 PM": "9:00 AM - 4:00 PM",
      },
    })
    .expect(201);
    console.log(doctorRes.body);

  // Get the doctor ID from the response
  const doctorId = doctorRes.body._id;

  // Now, book an appointment using the created user and doctor IDs
  const res = await api
    .post("/api/v1/user/book-appointment")
    .set("Authorization", `Bearer ${userToken}`)
    .send({
      doctorId:doctorId,
      userId:userId,
      doctorInfo: doctorId, // Pass the doctor ID as a string
      userInfo: userId,  // Assuming the user ID is the same as doctor ID for simplicity
      date: "01-08-2023",
      time: "10:00",
    })
    .expect(500);

  expect(res.body.success).toBe(false);
  // expect(res.body.message).toBe("Appointment Book successfully");
});



test("check booking availability", async () => {
  const res = await api
    .post("/api/v1/user/booking-availbility")
    .set("Authorization", `Bearer ${userToken}`)
    .send({
      doctorId: "doctor_id_here",
      date: "01-08-2023",
      time: "10:00",
    })
    .expect(200);

  expect(res.body.success).toBe(true);
  expect(res.body.message).toBe("Appointments available");
});


test("get user appointments", async () => {
  const res = await api
    .get("/api/v1/user/user-appointments")
    .set("Authorization", `Bearer ${userToken}`)
    .expect(200);

  expect(res.body.success).toBe(true);
  expect(res.body.message).toBe("Users Appointments Fetch SUccessfully");
  expect(res.body.data.length).toBe(0);
});




afterAll(async () => {await mongoose.connection.close()});









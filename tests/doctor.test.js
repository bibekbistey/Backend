const supertest = require("supertest");

const app = require("../server");

const api = supertest(app);

const doctorModel = require('../models/doctorModel');
const userModel = require('../models/userModels');
const appointmentModel = require('../models/appointmentModel');
const mongoose = require('mongoose');

let token = '';

beforeAll(async () => {

  // Clear the test database collections
  await doctorModel.deleteMany();
  await userModel.deleteMany();
  await appointmentModel.deleteMany();

  // Create a test doctor
  await doctorModel.create({
    userId: 'some_user_id',
    firstName: 'Test',
    lastName: 'Doctor',
    phone: '1234567890',
    email: 'testdoctor@test.com',
    website: 'https://testdoctor.com',
    address: 'Test Address',
    specialization: 'General Medicine',
    experience: '5 years',
    feesPerCunsaltation: 100,
    status: 'pending',
    timings: {
       '09:00 AM':"10:00PM"
    },
  });

  // Register a test user to obtain a valid token for authentication
  await api
    .post('/api/v1/user/register')
    .send({
      name: 'Test User',
      email: 'test2@gmail.com',
      password: 'test123',
    });

  const res = await api
    .post('/api/v1/user/login')
    .send({
      email: 'test2@gmail.com',
      password: 'test123',
    });

  token = res.body.token;
});

// Test cases for doctor-related API endpoints

test('Logged in doctor can get their own information', async () => {
  await api
    .post('/api/v1/doctor/getDoctorInfo')
    .set('Authorization', `Bearer ${token}`)
    .expect(200)
    .expect('Content-Type', /application\/json/)
    .then((res) => {
      // Add assertions for the response data
      expect(res.body.message).toBe('doctor data fetch success');
    //   expect(res.body.data.lastName).toBe('Doctor');
      // Add other necessary assertions for the doctor data
    });
});



test('Logged in doctor can update their profile', async () => {
  const updatedProfile = {
    firstName: 'Updated',
    lastName: 'Doctor',
    phone: '9876543210',
    // Mock updated doctor profile data here
  };

  await api
    .post('/api/v1/doctor/updateProfile')
    .set('Authorization', `Bearer ${token}`)
    .send(updatedProfile)
    .expect(201)
    .expect('Content-Type', /application\/json/)
    .then((res) => {
      // Add assertions for the response data
      expect(res.body.message).toBe("Doctor Profile Updated");
    //   expect(res.body.lastName).toBe('Doctor');
      // Add other necessary assertions for the updated doctor data
    });
});


test('doctor cannot update their profile without authentication', async () => {
  const updatedProfile = {
    firstName: 'Updated',
    lastName: 'Doctor',
    phone: '9876543210',
    // Mock updated doctor profile data here
  };

  await api
    .post('/api/v1/doctor/updateProfile')
    .send(updatedProfile)
    .expect(401)
});

test('Logged in doctor can get a single doctor by ID', async () => {
  const doctors = await doctorModel.find({});
  const doctor = doctors[0];

  await api
    .post('/api/v1/doctor/getDoctorById')
    .set('Authorization', `Bearer ${token}`)
    .expect(200)
    .expect('Content-Type', /application\/json/)
    .then((res) => {
      // Add assertions for the response data
      expect(res.body.message).toBe('Sigle Doc Info Fetched');
    //   expect(res.body.data.lastName).toBe('Doctor');
      // Add other necessary assertions for the doctor data
    });
});


test('doctor can get a single doctor by ID without authentication', async () => {
  const doctors = await doctorModel.find({});
  const doctor = doctors[0];

  await api
    .post('/api/v1/doctor/getDoctorById')
    .expect(401)
    
});


// test('Logged in doctors can get their appointments', async () => {
//   // Create some test appointments for the doctor
//   // await appointmentModel.create({
//   //   userId: 'some_user_id',
//   //   doctorId: 'some_doctor_id', // Use the existing doctor's _id
//   //   doctorInfo: 'Test Doctor Info',
//   //   userInfo: 'Test User Info',
//   //   date: '2023-08-02',
//   //   status: 'pending',
//   //   time: '10:00 AM',
//   // });

//   await request(app)
//     .get('/api/v1/doctor/doctor-appointments')
//     .set('Authorization', `Bearer ${token}`)
//     // .expect(200)
//     .expect('Content-Type', /application\/json/)
//     .then((res) => {
//       // Add assertions for the response data
//       expect(res.body).toHaveLength(1);

//       // Add more assertions as needed based on the appointment properties
//       const appointment = res.body.data[0];
      
//       expect(appointment.userInfo).toBe('Test User Info');
//     });
// });




test('Logged in doctor can update the status of an appointment', async () => {
  // Get the list of doctors to find the existing doctor
  const doctors = await doctorModel.find({});
  const doctor = doctors[0];

  // Create a test appointment for the doctor
  const appointment = await appointmentModel.create({
    userId: 'some_user_id',
    doctorId: doctor._id,
    doctorInfo: 'Test Doctor Info',
    userInfo: 'Test User Info',
    date: '2023-08-02',
    status: 'pending',
    time: '10:00 AM',
  });


  await api
    .post('/api/v1/doctor/update-status')
    .set('Authorization', `Bearer ${token}`)
    .send({
      appointmentsId: appointment._id,
      status: "pending",
    })
    .expect(200)
    .expect('Content-Type', /application\/json/)
    .then(async (res) => {
      // Add assertions for the response data
      expect(res.body.message).toBe('Appointment Status Updated');
    });
});




test('doctor can update the status of an appointment without authentication', async () => {
  // Get the list of doctors to find the existing doctor
  const doctors = await doctorModel.find({});
  const doctor = doctors[0];

  // Create a test appointment for the doctor
  const appointment = await appointmentModel.create({
    userId: 'some_user_id',
    doctorId: doctor._id,
    doctorInfo: 'Test Doctor Info',
    userInfo: 'Test User Info',
    date: '2023-08-02',
    status: 'pending',
    time: '10:00 AM',
  });


  await api
    .post('/api/v1/doctor/update-status')
    // .set('Authorization', `Bearer ${token}`)
    .send({
      appointmentsId: appointment._id,
      status: "pending",
    })
    .expect(401)
    
});

// Close the database connection after all tests

afterAll(async () => {
  // Close the database connection after all tests
  await mongoose.connection.close();
});

// jest.setTimeout(10000);

import { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { FaUserPlus } from "react-icons/fa";
import axios from "axios"; 
import Swal from "sweetalert2";
import LoadingScreen from "../user/components/LoadingScreen";


export default function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    email: '',
    password: '',
    password_confirmation: '',
    student_number: '',
    employee_id: '',
    course: '',
    dob: '',
    mobile: '',
    gender: '',
    nationality: 'Filipino',
    salutation: '',
    street: '',
    city: '',
    state: '',
    zipcode: '',
    telephone: '',
    account_type: ''
  });

  const [role, setRole] = useState("");
  const [courseType, setCourseType] = useState("");
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    const userToken = localStorage.getItem("auth_token");
    if (userToken) {
      navigate("/user");
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleRoleChange = (e) => {
  const selectedRole = e.target.value;
  setRole(selectedRole);

  let newCourseType = "";
  let accountType = "";

  if (selectedRole === "Employee") {
    newCourseType = "Employee";
    accountType = "Employee";
  } else if (selectedRole === "Student") {
    newCourseType = "SHS";
    accountType = "SHS";
  } else {
    newCourseType = "College";
    accountType = "College";
  }

  setCourseType(newCourseType);

  setFormData((prev) => ({
    ...prev,
    account_type: accountType,
    student_number: '',
    employee_id: '',
    course: '',
  }));
};




  const handleCheckboxChange = () => {
    setAgreeToTerms((prev) => !prev);
  };

  const validateForm = () => {
  if (formData.password !== formData.password_confirmation) {
    return "Passwords do not match";
  }
  if (!agreeToTerms) {
    return "You must agree to the terms and conditions.";
  }
  if (role === "Student" && !formData.student_number.trim()) {
    return "Student Number is required for Students.";
  }
  if (role === "Employee" && !formData.employee_id.trim()) {
    return "Employee ID is required for Employees.";
  }
  return "";
};
  

    const handleSubmit = async (e) => {
  e.preventDefault();

  const validationError = validateForm();
  if (validationError) {
    Swal.fire("Error", validationError, "error");
    return;
  }

  setLoading(true);

  const payload = {
    salutation: formData.salutation?.trim(),
    first_name: formData.firstName?.trim(),
    middle_name: formData.middleName?.trim(),
    last_name: formData.lastName?.trim(),
    email: formData.email?.trim(),
    password: formData.password,
    password_confirmation: formData.password_confirmation,
    employee_id: formData.employee_id?.trim(),
    student_number: formData.student_number?.trim(),
    course: formData.course?.trim(),
    dob: formData.dob,
    mobile: formData.mobile?.trim(),
    gender: formData.gender,
    nationality: formData.nationality,
    street: formData.street?.trim(),
    city: formData.city?.trim(),
    state: formData.state?.trim(),
    zipcode: formData.zipcode?.trim(),
    telephone: formData.telephone?.trim(),
    account_type: formData.account_type,
  };

  try {
  const response = await axios.post("http://localhost:8000/api/signup", payload);

  if (response.data?.success === true) {
    setLoading(false);
    Swal.fire("Success", "Registration successful! You can now log in.", "success").then(() => {
      navigate("/login");
    });
  } else {
    setLoading(false);
    Swal.fire("Error", response.data?.message || "Registration failed", "error");
  }
} catch (error) {
  setLoading(false);
  const message = error.response?.data?.message || "Something went wrong!";
  Swal.fire("Error", message, "error");
}
};

  const shsCourses = [
    { value: "ABM", text: "ABM" },
    { value: "STEM", text: "STEM" },
    { value: "HUMSS", text: "HUMSS" },
  ];

  const collegeDepartments = {
    "SABM (School of Accountancy, Business, and Management)": [
      { value: "BSA", text: "(BSA) Bachelor of Science in Accountancy" },
      { value: "BSBA-FINMGT", text: "(BSBA-FINMGT) BSBA Major in Financial Management" },
      { value: "BSBA-MKTGMGT", text: "(BSBA-MKTGMGT) BSBA Major in Marketing Management" },
      { value: "BSTM", text: "(BSTM) BS in Tourism" },
    ],
    "SACE (School of Architecture, Computing, and Engineering)": [
      { value: "BSARCH", text: "(BSARCH) BS in Architecture" },
      { value: "BSCE", text: "(BSCE) BS in Civil Engineering" },
      { value: "BSCS", text: "(BSCS) BS in Computer Science" },
      { value: "BSIT-MWA", text: "(BSIT-MWA) BSIT with Mobile/Web App" },
    ],
    "SAHS (School of Allied Health and Science)": [
      { value: "BSMT", text: "(BSMT) BS in Medical Technology" },
      { value: "BSN", text: "(BSN) BS in Nursing" },
      { value: "BSPSY", text: "(BSPSY) BS in Psychology" },
    ],
  };

  const renderCourses = () => {
  if (courseType === "SHS") {
    return shsCourses.map((c) => (
      <option key={c.value} value={c.value}>
        {c.text}
      </option>
    ));
  } else if (courseType === "College") {
    return Object.entries(collegeDepartments).map(([dept, courses]) => (
      <optgroup key={dept} label={dept}>
        {courses.map((c) => (
          <option key={c.value} value={c.value}>
            {c.text}
          </option>
        ))}
      </optgroup>
    ));
  } else {
    return <option disabled>No courses available</option>;
  }
};


  return (
    <div className="min-h-screen bg-white">
      {loading && <LoadingScreen />}
      <nav className="bg-[#35408E] p-4 flex justify-between items-center px-8">
        <div className="flex items-center space-x-3">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/NU_shield.svg/800px-NU_shield.svg.png"
            alt="NU Logo"
            className="w-12"
          />
          <span className="text-xl font-bold text-[#FFFFFF]">NU-LIPA</span>
        </div>
      </nav>

      <h2 className="text-xl font-bold text-[#31708F] flex justify-center items-center gap-2 mt-8 mb-10 pb-2">
        <FaUserPlus className="text-2xl" />
        Account Registration
      </h2>

      <form
        className="max-w-7xl mx-auto bg-white shadow-md p-8 grid grid-cols-1 md:grid-cols-2 gap-8"
         autoComplete="off"
        onSubmit={handleSubmit}
      >
        {/* User Credentials */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <i className="fas fa-user text-blue-700"></i> User Credentials
          </h3>
          <label className="block text-sm font-medium">Email Address*</label>
          <input
            required
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full border p-2 rounded mb-3"
          />

          <label className="block text-sm font-medium">Password*</label>
          <input
            required
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full border p-2 rounded mb-3"
          />

          <label className="block text-sm font-medium">Confirm Password*</label>
          <input
            required
            type="password"
            name="password_confirmation"
            value={formData.password_confirmation}
            onChange={handleChange}
            className="w-full border p-2 rounded mb-3"
          />
          
<label className="block text-sm font-medium">Account Type*</label>
<select
  required
  value={courseType}
  onChange={(e) => {
    const selected = e.target.value;
    setCourseType(selected);

    let accountType = "";
    if (selected === "SHS") accountType = "SHS";
    else if (selected === "College") accountType = "College";
    else if (selected === "Employee") accountType = "Employee";

    setFormData(prev => ({
      ...prev,
      course: "",
      account_type: accountType, 
      student_number: selected !== "Employee" ? "" : prev.student_number,
      employee_id: selected === "Employee" ? prev.employee_id : "",
    }));
  }}
  className="w-full border p-2 rounded mb-3"
>
  <option value="">Select Course Type</option>
  <option value="SHS">SHS</option>
  <option value="College">College</option>
  <option value="Employee">Employee</option>
</select>


<label className="block text-sm font-medium">
  {courseType === "Employee" ? "Employee ID*" : "Student Number*"}
</label>
<input
  required
  type="text"
  name={courseType === "Employee" ? "employee_id" : "student_number"}
  value={courseType === "Employee" ? formData.employee_id : formData.student_number}
  onChange={handleChange}
  className="w-full border p-2 rounded mb-3"
/>

{courseType !== "Employee" && (
  <>
    <label className="block text-sm font-medium">Course*</label>
    <select
      required
      name="course"
      value={formData.course}
      onChange={handleChange}
      className="w-full border p-2 rounded mb-3"
    >
      <option value="">Select Course</option>
      {renderCourses()}
    </select>
  </>
)}

          
        </div>

        {/* Basic Information */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <i className="fas fa-info-circle text-blue-700"></i> Basic Information
          </h3>
          <label className="block text-sm font-medium">Salutation*</label>
          <select
            name="salutation"
            value={formData.salutation}
            onChange={handleChange}
            className="w-full border p-2 rounded mb-3"
          >
            <option value="">Select Salutation</option>
            <option>Mr.</option>
            <option>Ms.</option>
            <option>Mrs.</option>
          </select>

          <label className="block text-sm font-medium">Last Name*</label>
          <input
            required
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            className="w-full border p-2 rounded mb-3"
          />

          <label className="block text-sm font-medium">First Name*</label>
          <input
            required
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            className="w-full border p-2 rounded mb-3"
          />

          <label className="block text-sm font-medium">Middle Name</label>
          <input
            type="text"
            name="middleName"
            autoComplete="off"
            value={formData.middleName}
            onChange={handleChange}
            className="w-full border p-2 rounded mb-3"
          />
          

          <label className="block text-sm font-medium">Gender*</label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className="w-full border p-2 rounded mb-3"
          >
            <option value="">Select Gender</option>
            <option>Male</option>
            <option>Female</option>
            <option>Other</option>
          </select>

          <label className="block text-sm font-medium">Date of Birth*</label>
          <input
            required
            type="date"
            name="dob"
            value={formData.dob}
            onChange={handleChange}
            className="w-full border p-2 rounded mb-3"
          />
        </div>

        {/* Address and Contacts */}
        <div className="md:col-span-2">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <i className="fas fa-map-marker-alt text-blue-700"></i> Address and Contacts
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium">Street/Barangay</label>
              <textarea
                name="street"
                value={formData.street}
                onChange={handleChange}
                className="w-full border p-2 rounded mb-3"
                rows="2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">City/Municipality*</label>
              <input
                required
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full border p-2 rounded mb-3"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">State/Province*</label>
              <input
                required
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                className="w-full border p-2 rounded mb-3"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Country*</label>
              <input
                required
                type="text"
                value="Philippines"
                disabled
                className="w-full border p-2 rounded mb-3 bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Zipcode</label>
              <input
                type="text"
                name="zipcode"
                value={formData.zipcode}
                onChange={handleChange}
                className="w-full border p-2 rounded mb-3"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Telephone No.</label>
              <input
                required
                type="text"
                name="telephone"
                value={formData.telephone}
                onChange={handleChange}
                className="w-full border p-2 rounded mb-3"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Mobile No.*</label>
              <input
                required
                type="text"
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                className="w-full border p-2 rounded mb-3"
              />
            </div>
          </div>
        </div>

        {/* Terms and Buttons */}
        <div className="md:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <input
              type="checkbox"
              checked={agreeToTerms}
              onChange={handleCheckboxChange}
            />
            <label className="text-sm">
              I agree to the{" "}
              <span className="text-blue-500 underline cursor-pointer">
                NU CARES: Service Terms & Conditions
              </span>
            </label>
          </div>

          {errorMessage && <p className="text-red-500 text-sm">{errorMessage}</p>}

          <div className="flex gap-4">
            <div className="flex flex-col justify-center items-center">
            <button
              type="submit"
              className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
              
            >
              {"Register"}
            </button>
            </div>

            <NavLink to="/login">
              <button
                type="button"
                className="bg-yellow-400 text-white px-6 py-2 rounded hover:bg-yellow-500"
              >
                Cancel
              </button>
            </NavLink>
          </div>
        </div>
      </form>
    </div>
  );
}

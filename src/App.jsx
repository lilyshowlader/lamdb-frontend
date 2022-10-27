// npm modules
import { useState, useEffect } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'

// page components
import Signup from './pages/Signup/Signup'
import Login from './pages/Login/Login'
import Landing from './pages/Landing/Landing'
import MyProfile from './pages/MyProfile/MyProfile'
import AddPet from './pages/AddPet/AddPet'
import AddVet from './pages/AddVet/AddVet'
import PetDetails from './pages/PetDetails/PetDetails'
import VetDetails from './pages/VetDetails/VetDetails'
import EditPet from './pages/EditPet/EditPet'
import ChangePassword from './pages/ChangePassword/ChangePassword'

// components
import NavBar from './components/NavBar/NavBar'
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute'

// services
import * as authService from './services/authService'
import * as petService from './services/petService'
import * as vetService from './services/vetService'
import * as profileService from './services/profileService'

// styles
import './App.css'

const App = () => {
  // setting state
  const [user, setUser] = useState(authService.getUser())
  const [pets, setPets] = useState([])
  const [vets, setVets] = useState([])
  const navigate = useNavigate()
  const [profile, setProfile] = useState([])

  // use effects
  
  useEffect(() => {
    const fetchProfile = async () => {
      const profileData = await profileService.getMyProfile()
      setProfile(profileData)
    }
    fetchProfile()
  }, [])

  useEffect(() => {
    const fetchPets = async () => {
      const petsData = await petService.getPets()
      setPets(petsData)
    }
    fetchPets()
    console.log('this is pets', pets);
  }, [])

  useEffect(() => {
    const fetchVets = async () => {
      const vetsData = await vetService.getVets()
      setVets(vetsData)
    }
    fetchVets()
    console.log('this is vets', vets);
  }, [])




  // functions for pet and vet
  const handleAddPet = async (newPetData, photo) => {
    const newPet = await petService.create(newPetData)
    if (photo) {
      newPet.photo = await petPhotoHelper(photo, newPet._id)
    }
    setPets([...pets, newPet])
    navigate('/my-profile')
  }

  const handleAddVet = async (newVetData) => {
    const newVet = await vetService.create(newVetData)
      setVets([...vets, newVet])
      navigate(`/vetDetails/${newVet._id}`)
  }

  const handleUpdatePet = async (updatedPet, photo) => {
    const updatedPetData = await petService.update(updatedPet)
    if (photo) {
      updatedPetData.photo = await petPhotoHelper(photo, updatedPet._id)
    }
    const newPetsArray = pets.map(pet => 
      pet._id === updatedPetData._id ? updatedPetData : pet
    )
    setPets(newPetsArray)
		navigate('/my-profile')
  }

  // const handleUpdateVet = async (updatedVet) => {
  //   const updatedVetData = await vetService.update(updatedVet)
  //   // if (photo) {
  //   //   updatedPetData.photo = await petPhotoHelper(photo, updatedPet._id)
  //   // }
  //   const newVetsArray = vets.map(vet => 
  //     vet._id === updatedVetData._id ? updatedVetData : vet
  //   )
  //   setVets(newVetsArray)
	// 	navigate('/my-profile')
  // }


  const petPhotoHelper = async (photo, id) => {
    const photoData = new FormData()
    photoData.append('photo', photo)
    return await petService.addPhoto(photoData, id)
  }

	const handleDeletePet = async id => {
    const deletedPet = await petService.deleteOne(id)
    setPets(pets.filter(pet => pet._id !== deletedPet._id))
    navigate('/my-profile')
  }

  // const handleDeleteVet = async id => {
  //   const deletedVet = await vetService.deleteOne(id)
  //   setVets(vets.filter(vet => vet._id !== deletedVet._id))
  //   navigate('/petDetails/:id')
  // }


  // user login log out functions
  const handleLogout = () => {
    authService.logout()
    setUser(null)
    navigate('/')
  }

  const handleSignupOrLogin = () => {
    setUser(authService.getUser())
  }

  return (
    <>
      <NavBar user={user} handleLogout={handleLogout} />
      <Routes>
        <Route path="/" element={<Landing user={user} />} />
        <Route
          path="/signup"
          element={<Signup handleSignupOrLogin={handleSignupOrLogin} />}
        />
        <Route
          path="/login"
          element={<Login handleSignupOrLogin={handleSignupOrLogin} />}
        />
        <Route
          path="/my-profile"
          element={
            <ProtectedRoute user={user}>
              <MyProfile profile={profile} handleAddPet={handleAddPet} handleDeletePet={handleDeletePet} pets={pets} /> 
            </ProtectedRoute>
          }
        />
        <Route
          path="/changePassword"
          element={
            <ProtectedRoute user={user}>
              <ChangePassword handleSignupOrLogin={handleSignupOrLogin} />
            </ProtectedRoute>
          }
        />
        <Route path='/addPet' element={<AddPet handleAddPet={handleAddPet} handleDeletePet={handleDeletePet} pets={pets}/>} />

        <Route path='/petDetails/:id' element={<PetDetails profile={profile} pets={pets} handleDeletePet={handleDeletePet} />} />
        
        <Route path='/pets/:id/edit' element={<EditPet handleUpdatePet={handleUpdatePet}/>} />
        <Route path='/addVet' element={<AddVet handleAddVet={handleAddVet} pets={pets} vets={vets} />} />
        
        <Route path='/vetDetails/:id' element={<VetDetails pets={pets} vets={vets}/>} />
      </Routes>
    </>
  )
}

export default App

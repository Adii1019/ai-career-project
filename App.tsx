import React, { useState, useCallback, useEffect } from 'react';
import { quizDataByField } from './services/fallbackData';
import { UserProfile, AppState, UserType, CareerRecommendation, User } from './types';
import UserTypeSelector from './components/UserTypeSelector';
import ProfileForm from './components/ProfileForm';
import ResultsDisplay from './components/ResultsDisplay';
import { getCareerRecommendations } from './services/geminiService';
import LoadingSpinner from './components/LoadingSpinner';
import ResumeBuilder from './components/ResumeBuilder';
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';
import { signIn, signUp } from './services/authService';

const initialState: UserProfile = {
  name: '',
  email: '',
  phone: '',
  age: '',
  location: '',
  education10th: '',
  education10thSchool: '',
  education12th: '',
  education12thSchool: '',
  education12thStream: '',
  educationHistory: [],
  hardSkills: '',
  softSkills: '',
  toolsAndSoftware: '',
  certifications: '',
  languages: '',
  internships: '',
  projects: '',
  favoriteSubjects: '',
  subjectProficiency: {},
  quizAnswers: {},
  preferredIndustries: '',
  workPreferences: '',
  higherStudies: '',
  dreamJobRoles: '',
  resume: null,
};

const loadingMessages = [
  'Our AI is crafting your personalized career path. This might take a moment.',
  'Analyzing your academic background...',
  'Evaluating your unique skills and talents...',
  'Cross-referencing your interests with top industries...',
  'Identifying potential skill gaps and opportunities...',
  'Crafting personalized learning paths...',
  'Finalizing your top career matches...',
];

interface AppData {
  quizQuestions: any;
  educationFields: any[];
  formStructureByField: any;
}

function App() {
  const [appState, setAppState] = useState<AppState>(AppState.USER_TYPE_SELECTION);
  const [userType, setUserType] = useState<UserType | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile>(initialState);
  const [recommendations, setRecommendations] = useState<CareerRecommendation[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [textFadeClass, setTextFadeClass] = useState('opacity-100');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [appData, setAppData] = useState<AppData | null>(null);
  const [dataError, setDataError] = useState<string | null>(null);

  /* =====================================================
     ✅ ONLY QUIZ DATA SOURCE IS CHANGED HERE
     ===================================================== */
  useEffect(() => {
    const fetchAppData = async () => {
      try {
        const [eduRes, formRes] = await Promise.all([
          fetch('./data/educationFields.json'),
          fetch('./data/formStructureByField.json'),
        ]);

        if (!eduRes.ok || !formRes.ok) {
          throw new Error('Failed to load critical application data.');
        }

        const educationFields = await eduRes.json();
        const formStructureByField = await formRes.json();

        // ✅ Inject quiz from fallbackData.ts
        setAppData({
          quizQuestions: quizDataByField,
          educationFields,
          formStructureByField,
        });
      } catch (err: any) {
        setDataError(err.message || 'Could not load application resources. Please refresh the page.');
      }
    };

    fetchAppData();
  }, []);

  /* ===================================================== */

  useEffect(() => {
    let intervalId: number | undefined;
    let timeoutId: number | undefined;

    if (appState === AppState.GENERATING) {
      setLoadingMessageIndex(0);
      setTextFadeClass('opacity-100');

      intervalId = window.setInterval(() => {
        setTextFadeClass('opacity-0');
        timeoutId = window.setTimeout(() => {
          setLoadingMessageIndex(prev => (prev + 1) % loadingMessages.length);
          setTextFadeClass('opacity-100');
        }, 300);
      }, 1800);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [appState]);

  const handleUserTypeSelect = (type: UserType) => {
    setUserType(type);
    setAppState(AppState.SIGN_IN);
  };

  const handleSignUp = async (name: string, email: string, password: string) => {
    await signUp(name, email, password, userType!);
    alert('Account created successfully! Please sign in.');
    setAppState(AppState.SIGN_IN);
  };

  const handleSignIn = async (email: string, password: string) => {
    const user = await signIn(email, password, userType!);
    setCurrentUser(user);
    setUserProfile(prev => ({ ...prev, name: user.name, email: user.email }));
    setAppState(AppState.PROFILE_BUILDING);
  };

  const handleProfileComplete = (profile: UserProfile) => {
    setUserProfile(profile);
    if (userType === UserType.IN_EDUCATION) {
      setAppState(AppState.RESUME_BUILDER);
    } else {
      handleFormSubmit(profile);
    }
  };

  const handleFormSubmit = useCallback(async (profile: UserProfile) => {
    if (!appData) return;

    setAppState(AppState.GENERATING);
    setError(null);

    try {
      const result = await getCareerRecommendations(
        profile,
        userType!,
        appData.quizQuestions
      );

      setRecommendations(result.recommendations);
      setAppState(AppState.RESULTS);
    } catch (err: any) {
      setError(err.message || 'Error generating recommendations.');
      setAppState(AppState.PROFILE_BUILDING);
    }
  }, [userType, appData]);

  const handleResumeProceed = (updatedProfile: UserProfile) => {
    setUserProfile(updatedProfile);
    handleFormSubmit(updatedProfile);
  };

  const handleReset = () => {
    setUserProfile(initialState);
    setUserType(null);
    setRecommendations([]);
    setError(null);
    setCurrentUser(null);
    setAppState(AppState.USER_TYPE_SELECTION);
  };

  const renderContent = () => {
    if (dataError) {
      return <div className="text-red-500 p-4">{dataError}</div>;
    }

    if (!appData) {
      return <LoadingSpinner />;
    }

    switch (appState) {
      case AppState.USER_TYPE_SELECTION:
        return <UserTypeSelector onSelect={handleUserTypeSelect} />;
      case AppState.SIGN_IN:
        return <SignIn userType={userType!} onSignIn={handleSignIn} />;
      case AppState.SIGN_UP:
        return <SignUp userType={userType!} onSignUp={handleSignUp} />;
      case AppState.PROFILE_BUILDING:
        return (
          <ProfileForm
            userType={userType!}
            profile={userProfile}
            setProfile={setUserProfile}
            onComplete={handleProfileComplete}
            error={error}
            appData={appData}
          />
        );
      case AppState.RESUME_BUILDER:
        return <ResumeBuilder profile={userProfile} onProceed={handleResumeProceed} />;
      case AppState.GENERATING:
  return (
    <div className="flex flex-col items-center justify-center h-screen p-4">
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-10 rounded-2xl shadow-2xl text-center flex flex-col items-center w-full max-w-lg">
        <LoadingSpinner />
        <h2 className="text-2xl font-bold mt-6 text-slate-800 dark:text-slate-100">
          Analyzing your profile...
        </h2>
        <div className="h-12 mt-2 flex items-center justify-center">
          <p
            className={`text-slate-600 dark:text-slate-400 text-center transition-opacity duration-300 ease-in-out ${textFadeClass}`}
          >
            {loadingMessages[loadingMessageIndex]}
          </p>
        </div>
      </div>
    </div>
  );

      case AppState.RESULTS:
        return <ResultsDisplay recommendations={recommendations} onReset={handleReset} />;
      default:
  return <UserTypeSelector onSelect={handleUserTypeSelect} />;

    }
  };

  return <div className="min-h-screen font-sans">{renderContent()}</div>;
}

export default App;

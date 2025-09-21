import { useState, useEffect } from "react";
import Button from "../components/ui/button";
import {
  Calendar,
  Calendar1,
  Edit2,
  Mail,
  MapPin,
  Save,
  X,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Badge } from "../components/ui/badge";
import { useFetchUserProfile } from "../api/hooks/useFetchProfile";
import type { UserProfile } from "../store/UserStore";
import { useForm } from "react-hook-form";
import { logger } from "../utils/logger";
import { formatDate } from "../utils/formatDate";
import { Skeleton } from "../components/ui/skeleton";
import ErrorPage from "./ErrorPage";
import AxiosInstance from "../utils/AxiosInstance";
import { SINGLE_USER } from "../constants/Api";
import { loggedInUserId } from "../utils/auth";
import { toast } from "react-toastify";

const MyProfilePage = () => {
  const [isEditing, setIsEditing] = useState(false);
  const { data, isLoading, isError } = useFetchUserProfile();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UserProfile>({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      bio: "",
      professionalDetails: {
        location: "",
        companyName: "",
        designation: "",
        experience: "",
        skills: [],
      },
      socialLinks: {
        github: "",
        linkedIn: "",
        personalPortfolio: "",
      },
      createdAt: undefined,
    },
  });

  // Reset values when profile is fetched
  useEffect(() => {
    if (data) reset(data);
  }, [data, reset]);

  const onSubmit = async (values: UserProfile) => {
    const userId = loggedInUserId();
    if (!userId) return;
    try {
      const response = await AxiosInstance.put(
        `${SINGLE_USER}/${userId}`,
        values
      );
      if (response.status === 200) {
        toast.success("Profile updated successfully");
        setIsEditing(false);
      }
    } catch (error) {
      logger.error("Error updating profile:", error);
    }
  };

  const handleCancel = () => {
    reset(data); // rollback changes
    setIsEditing(false);
  };

  const stats = [
    { label: "Problems Solved", value: "245" },
    { label: "Current Streak", value: "12 days" },
    { label: "Interview Score", value: "85%" },
    { label: "Study Hours", value: "156h" },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-10 w-24" />
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-lg" />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left side */}
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-64 w-full rounded-lg" />
            <Skeleton className="h-48 w-full rounded-lg" />
          </div>

          {/* Right side */}
          <div className="space-y-6">
            <Skeleton className="h-40 w-full rounded-lg" />
            <Skeleton className="h-40 w-full rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (isError) return <ErrorPage message="Failed to load user profile." />;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">My Profile</h1>
        {!isEditing ? (
          <Button
            type="button"
            onClick={() => setIsEditing(true)}
            className="gap-2 flex items-center text-primary-foreground"
          >
            <Edit2 className="h-4 w-4" />
            Edit Profile
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button type="submit" className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              Save
            </Button>
            <Button
              type="button"
              variant="outlinePrimary"
              onClick={handleCancel}
              className="flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Cancel
            </Button>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card
            key={index}
            className="flex flex-row justify-center items-center gap-2"
          >
            <Calendar1 size={28} color="pink" />
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Profile Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Manage your personal details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src="/placeholder.svg" />
                  <AvatarFallback className="text-lg">JD</AvatarFallback>
                </Avatar>
                {isEditing && (
                  <Button type="button" variant="outlinePrimary" size="sm">
                    Change Photo
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* First Name */}
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    disabled={!isEditing}
                    {...register("firstName", {
                      required: "First name is required",
                    })}
                    error={errors.firstName?.message}
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" isMandatory={true}>
                    Email
                  </Label>
                  <Input
                    id="email"
                    error={errors.email?.message}
                    disabled={!isEditing}
                    {...register("email", {
                      required: "Email is required",
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Invalid email address",
                      },
                    })}
                  />
                </div>

                {/* Location */}
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    disabled={!isEditing}
                    {...register("professionalDetails.location")}
                  />
                </div>

                {/* Company */}
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company</Label>
                  <Input
                    id="companyName"
                    disabled={!isEditing}
                    {...register("professionalDetails.companyName")}
                  />
                </div>
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  rows={3}
                  disabled={!isEditing}
                  {...register("bio")}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Professional Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="designation">Current Role</Label>
                  <Input
                    id="designation"
                    disabled={!isEditing}
                    {...register("professionalDetails.designation")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="experience">Experience</Label>
                  <Input
                    id="experience"
                    disabled={!isEditing}
                    {...register("professionalDetails.experience")}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Skills</Label>
                <div className="flex flex-wrap gap-2">
                  {data?.professionalDetails.skills?.map((skill, index) => (
                    <Badge key={index} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
                {isEditing && (
                  <Button
                    type="button"
                    variant="outlinePrimary"
                    size="sm"
                    className="mt-2"
                  >
                    Manage Skills
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  Joined {data?.createdAt && formatDate(data?.createdAt)}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  {data?.professionalDetails.location}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{data?.email}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Social Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="github">GitHub</Label>
                <Input
                  id="github"
                  disabled={!isEditing}
                  placeholder="https://github.com/username"
                  {...register("socialLinks.github")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="linkedIn">LinkedIn</Label>
                <Input
                  id="linkedIn"
                  disabled={!isEditing}
                  placeholder="https://linkedin.com/in/username"
                  {...register("socialLinks.linkedIn")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="personalPortfolio">Portfolio</Label>
                <Input
                  id="personalPortfolio"
                  disabled={!isEditing}
                  placeholder="https://yourportfolio.com"
                  {...register("socialLinks.personalPortfolio")}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
};

export default MyProfilePage;

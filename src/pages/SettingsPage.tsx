import { useState } from "react";
import MainLayout from "../components/layout/MainLayout";
import Button from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Switch } from "../components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { Badge } from "../components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../components/ui/alert-dialog";
import {
  Settings,
  Bell,
  Shield,
  Palette,
  Download,
  Trash2,
  Key,
  Globe,
  Moon,
  Sun,
  Monitor,
} from "lucide-react";
import { useTheme } from "next-themes";
import { toast } from "react-toastify";
import { Separator } from "../components/ui/seperator";

const SettingsPage = () => {
  const { theme, setTheme } = useTheme();

  const [settings, setSettings] = useState({
    // Notifications
    emailNotifications: true,
    pushNotifications: false,
    weeklyReport: true,
    streakReminders: true,
    newFeatures: false,

    // Privacy
    profileVisibility: "public",
    showProgress: true,
    showStreaks: true,
    allowMessages: false,

    // Study Preferences
    dailyGoal: "60",
    difficulty: "medium",
    categories: ["arrays", "strings", "dynamic-programming"],
    autoMarkComplete: true,
    showHints: true,

    // Account
    twoFactorEnabled: false,
    sessionTimeout: "24",
  });

  const handleSettingChange = (key: string, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    toast.success("Your preferences have been saved.");
  };

  const exportData = () => {
    // Simulate data export
    toast.success("Your data export will be emailed to you shortly.");
  };

  const deleteAccount = () => {
    // This would typically call an API to delete the account
    toast.warning(
      "Your account will be deleted within 30 days. You can cancel this action by contacting support."
    );
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-2">
          <Settings className="h-8 w-8" />
          <h1 className="text-3xl font-bold">Settings</h1>
        </div>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="privacy">Privacy</TabsTrigger>
            <TabsTrigger value="study">Study</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Appearance
                </CardTitle>
                <CardDescription>
                  Customize the look and feel of your dashboard
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Theme</Label>
                  <Select value={theme} onValueChange={setTheme}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">
                        <div className="flex items-center gap-2">
                          <Sun className="h-4 w-4" />
                          Light
                        </div>
                      </SelectItem>
                      <SelectItem value="dark">
                        <div className="flex items-center gap-2">
                          <Moon className="h-4 w-4" />
                          Dark
                        </div>
                      </SelectItem>
                      <SelectItem value="system">
                        <div className="flex items-center gap-2">
                          <Monitor className="h-4 w-4" />
                          System
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Language & Region
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Language</Label>
                  <Select defaultValue="en">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="de">Deutsch</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Timezone</Label>
                  <Select defaultValue="pst">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pst">
                        Pacific Standard Time (PST)
                      </SelectItem>
                      <SelectItem value="est">
                        Eastern Standard Time (EST)
                      </SelectItem>
                      <SelectItem value="utc">
                        Coordinated Universal Time (UTC)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notification Preferences
                </CardTitle>
                <CardDescription>
                  Choose what notifications you want to receive
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive updates via email
                    </p>
                  </div>
                  <Switch
                    checked={settings.emailNotifications}
                    onCheckedChange={(value) =>
                      handleSettingChange("emailNotifications", value)
                    }
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive browser notifications
                    </p>
                  </div>
                  <Switch
                    checked={settings.pushNotifications}
                    onCheckedChange={(value) =>
                      handleSettingChange("pushNotifications", value)
                    }
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Weekly Progress Report</Label>
                    <p className="text-sm text-muted-foreground">
                      Get a summary of your weekly progress
                    </p>
                  </div>
                  <Switch
                    checked={settings.weeklyReport}
                    onCheckedChange={(value) =>
                      handleSettingChange("weeklyReport", value)
                    }
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Streak Reminders</Label>
                    <p className="text-sm text-muted-foreground">
                      Get reminded to maintain your streak
                    </p>
                  </div>
                  <Switch
                    checked={settings.streakReminders}
                    onCheckedChange={(value) =>
                      handleSettingChange("streakReminders", value)
                    }
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label>New Feature Announcements</Label>
                    <p className="text-sm text-muted-foreground">
                      Be notified about new features
                    </p>
                  </div>
                  <Switch
                    checked={settings.newFeatures}
                    onCheckedChange={(value) =>
                      handleSettingChange("newFeatures", value)
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="privacy" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Privacy Settings
                </CardTitle>
                <CardDescription>
                  Control who can see your information and progress
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Profile Visibility</Label>
                  <Select
                    value={settings.profileVisibility}
                    onValueChange={(value) =>
                      handleSettingChange("profileVisibility", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">
                        Public - Anyone can view
                      </SelectItem>
                      <SelectItem value="friends">Friends only</SelectItem>
                      <SelectItem value="private">Private - Only me</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Show Progress Stats</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow others to see your problem-solving progress
                    </p>
                  </div>
                  <Switch
                    checked={settings.showProgress}
                    onCheckedChange={(value) =>
                      handleSettingChange("showProgress", value)
                    }
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Show Streaks</Label>
                    <p className="text-sm text-muted-foreground">
                      Display your current and longest streaks
                    </p>
                  </div>
                  <Switch
                    checked={settings.showStreaks}
                    onCheckedChange={(value) =>
                      handleSettingChange("showStreaks", value)
                    }
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Allow Direct Messages</Label>
                    <p className="text-sm text-muted-foreground">
                      Let other users send you messages
                    </p>
                  </div>
                  <Switch
                    checked={settings.allowMessages}
                    onCheckedChange={(value) =>
                      handleSettingChange("allowMessages", value)
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="study" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Study Preferences</CardTitle>
                <CardDescription>
                  Customize your learning experience
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Daily Goal (minutes)</Label>
                  <Input
                    type="number"
                    value={settings.dailyGoal}
                    onChange={(e) =>
                      handleSettingChange("dailyGoal", e.target.value)
                    }
                    min="15"
                    max="480"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Preferred Difficulty</Label>
                  <Select
                    value={settings.difficulty}
                    onValueChange={(value) =>
                      handleSettingChange("difficulty", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                      <SelectItem value="mixed">Mixed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Focus Categories</Label>
                  <div className="flex flex-wrap gap-2">
                    {settings.categories.map((category, index) => (
                      <Badge key={index} variant="secondary">
                        {category.replace("-", " ")}
                      </Badge>
                    ))}
                  </div>
                  <Button variant="outline" size="sm">
                    Manage Categories
                  </Button>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Auto-mark Complete</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically mark problems as complete when solved
                    </p>
                  </div>
                  <Switch
                    checked={settings.autoMarkComplete}
                    onCheckedChange={(value) =>
                      handleSettingChange("autoMarkComplete", value)
                    }
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Show Hints</Label>
                    <p className="text-sm text-muted-foreground">
                      Display hint buttons for problems
                    </p>
                  </div>
                  <Switch
                    checked={settings.showHints}
                    onCheckedChange={(value) =>
                      handleSettingChange("showHints", value)
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="account" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  Security
                </CardTitle>
                <CardDescription>
                  Manage your account security settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  <Switch
                    checked={settings.twoFactorEnabled}
                    onCheckedChange={(value) =>
                      handleSettingChange("twoFactorEnabled", value)
                    }
                  />
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label>Session Timeout (hours)</Label>
                  <Select
                    value={settings.sessionTimeout}
                    onValueChange={(value) =>
                      handleSettingChange("sessionTimeout", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 hour</SelectItem>
                      <SelectItem value="8">8 hours</SelectItem>
                      <SelectItem value="24">24 hours</SelectItem>
                      <SelectItem value="168">1 week</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Separator />
                <Button variant="outline">Change Password</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Data Export
                </CardTitle>
                <CardDescription>
                  Download your data for backup or transfer
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={exportData} variant="outline">
                  Export My Data
                </Button>
              </CardContent>
            </Card>

            <Card className="border-destructive">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <Trash2 className="h-5 w-5" />
                  Danger Zone
                </CardTitle>
                <CardDescription>
                  Irreversible actions that affect your account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">Delete Account</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Are you absolutely sure?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently
                        delete your account and remove all your data from our
                        servers.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={deleteAccount}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Yes, delete my account
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default SettingsPage;

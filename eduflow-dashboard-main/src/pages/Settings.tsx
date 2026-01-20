import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, Bell, Shield, Palette, Save } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";

export default function Settings() {
  const { user } = useAuth();
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: ""
  });

  const [profile, setProfile] = useState({
    firstName: "Admin",
    lastName: "Système",
    email: "admin@educenter.tn",
    phone: "+216 XX XXX XXX"
  });

  const [isUpdating, setIsUpdating] = useState(false);

  const handlePasswordChange = async () => {
    if (passwords.new !== passwords.confirm) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }
    if (passwords.new.length < 4) {
      toast.error("Le mot de passe doit faire au moins 4 caractères");
      return;
    }

    setIsUpdating(true);
    try {
      const res = await apiFetch('http://localhost:8080/api/users/change-password', {
        method: 'POST',
        body: JSON.stringify({
          username: user?.username,
          newPassword: passwords.new
        })
      });

      if (res.ok) {
        toast.success("Mot de passe mis à jour avec succès");
        setPasswords({ current: "", new: "", confirm: "" });
      } else {
        toast.error("Échec de la mise à jour");
      }
    } catch (error) {
      toast.error("Erreur de connexion au serveur");
    } finally {
      setIsUpdating(false);
    }
  };
  return (
    <Layout
      breadcrumbs={[
        { label: "Tableau de bord", href: "/" },
        { label: "Paramètres" },
      ]}
      title="Paramètres"
    >
      <div className="max-w-4xl">
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="bg-muted/50 p-1">
            <TabsTrigger value="profile" className="gap-2">
              <User className="h-4 w-4" />
              Profil
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2">
              <Shield className="h-4 w-4" />
              Sécurité
            </TabsTrigger>
            <TabsTrigger value="appearance" className="gap-2">
              <Palette className="h-4 w-4" />
              Apparence
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <div className="bg-card rounded-xl border shadow-card p-6">
              <h3 className="text-lg font-semibold mb-4">Informations personnelles</h3>

              <div className="flex items-center gap-6 mb-6">
                <Avatar className="h-20 w-20">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                    AD
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Button variant="outline" size="sm">
                    Changer la photo
                  </Button>
                  <p className="text-sm text-muted-foreground mt-1">
                    JPG, PNG ou GIF. 1MB max.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Prénom</Label>
                  <Input
                    id="firstName"
                    value={profile.firstName}
                    onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Nom</Label>
                  <Input
                    id="lastName"
                    value={profile.lastName}
                    onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input
                    id="phone"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <Button onClick={() => toast.success("Informations de profil mises à jour")}>
                  <Save className="h-4 w-4 mr-2" />
                  Enregistrer
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <div className="bg-card rounded-xl border shadow-card p-6">
              <h3 className="text-lg font-semibold mb-4">Préférences de notification</h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium">Nouvelles inscriptions</p>
                    <p className="text-sm text-muted-foreground">
                      Recevoir une notification pour chaque nouvelle inscription
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium">Notes publiées</p>
                    <p className="text-sm text-muted-foreground">
                      Recevoir une notification lors de la saisie de nouvelles notes
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium">Rappels de séances</p>
                    <p className="text-sm text-muted-foreground">
                      Notifications de début de cours selon l'emploi du temps
                    </p>
                  </div>
                  <Switch />
                </div>
                <Separator />
                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium">Alertes de seuil d'inscription</p>
                    <p className="text-sm text-muted-foreground">
                      Notifier quand un cours atteint sa capacité maximale
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <Button>
                  <Save className="h-4 w-4 mr-2" />
                  Sauvegarder
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <div className="bg-card rounded-xl border shadow-card p-6">
              <h3 className="text-lg font-semibold mb-4">Changer le mot de passe</h3>

              <div className="space-y-4 max-w-md">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Mot de passe actuel</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={passwords.current}
                    onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={passwords.new}
                    onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={passwords.confirm}
                    onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex justify-start mt-6">
                <Button onClick={handlePasswordChange} disabled={isUpdating}>
                  {isUpdating ? "Mise à jour..." : "Mettre à jour"}
                </Button>
              </div>
            </div>

            <div className="bg-card rounded-xl border shadow-card p-6">
              <h3 className="text-lg font-semibold mb-4">Sessions actives</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Gérez les appareils connectés à votre compte.
              </p>

              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 px-4 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium">Chrome sur Windows</p>
                    <p className="text-sm text-muted-foreground">
                      Tunis, Tunisie • Actif maintenant
                    </p>
                  </div>
                  <Badge className="bg-success-muted text-success">Actuel</Badge>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="appearance" className="space-y-6">
            <div className="bg-card rounded-xl border shadow-card p-6">
              <h3 className="text-lg font-semibold mb-4">Thème</h3>

              <div className="grid grid-cols-3 gap-4">
                <button className="p-4 rounded-lg border-2 border-primary bg-background text-center">
                  <div className="h-12 bg-background rounded border mb-2"></div>
                  <span className="text-sm font-medium">Clair</span>
                </button>
                <button className="p-4 rounded-lg border-2 border-border bg-background text-center hover:border-muted-foreground transition-colors">
                  <div className="h-12 bg-foreground rounded mb-2"></div>
                  <span className="text-sm font-medium">Sombre</span>
                </button>
                <button className="p-4 rounded-lg border-2 border-border bg-background text-center hover:border-muted-foreground transition-colors">
                  <div className="h-12 bg-gradient-to-r from-background to-foreground rounded mb-2"></div>
                  <span className="text-sm font-medium">Système</span>
                </button>
              </div>
            </div>

            <div className="bg-card rounded-xl border shadow-card p-6">
              <h3 className="text-lg font-semibold mb-4">Langue</h3>

              <div className="max-w-xs">
                <select className="w-full px-3 py-2 rounded-lg border border-input bg-background">
                  <option value="fr">Français</option>
                  <option value="en">English</option>
                  <option value="ar">العربية</option>
                </select>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}

import { Badge } from "@/components/ui/badge";

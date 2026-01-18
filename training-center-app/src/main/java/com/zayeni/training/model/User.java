package com.zayeni.training.model;

import java.io.Serializable;
import java.util.Collection;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.Table;
import jakarta.persistence.FetchType;

@Entity
@Table(name = "users")
public class User implements Serializable {

    @Id
    private String username;
    private String password;
    private boolean enabled;
    private boolean actived;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(name = "USERS_ROLES")
    private Collection<Role> roles;

    public User() {
        super();
    }

    public User(String username, String password, boolean actived, Collection<Role> roles) {
        super();
        this.username = username;
        this.password = password;
        this.actived = actived;
        this.roles = roles;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public boolean isActived() {
        return actived;
    }

    public void setActived(boolean actived) {
        this.actived = actived;
    }

    public Collection<Role> getRoles() {
        return roles;
    }

    public void setRoles(Collection<Role> roles) {
        this.roles = roles;
    }

    @Override
    public String toString() {
        return "User [username=" + username + ", actived=" + actived + "]";
    }
}

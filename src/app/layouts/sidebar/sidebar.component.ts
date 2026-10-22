import { Component, OnInit, EventEmitter, Output, ViewChild, ElementRef } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

import { MENU } from './menu';
import { MenuItem } from './menu.model';
import { environment } from 'src/environments/environment';
import { SidebarService } from './sidebar.service';
import { TokenStorage } from 'src/app/account/token-storage.service';
import { ChatNotificationService } from 'src/app/pages/chat/chat-notification.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {

  menu: any;
  toggle: any = true;
  menuItems: any[] = [];
  @ViewChild('sideMenu') sideMenu!: ElementRef;
  @Output() mobileMenuButtonClicked = new EventEmitter();

  constructor(private router: Router, public translate: TranslateService,private sideBar:SidebarService,private token:TokenStorage, public chatNotifications: ChatNotificationService) {
    translate.setDefaultLang('en');
  }

  private containsChat(items: any[] | null | undefined): boolean {
    return (items || []).some(i => this.isChatItem(i) || this.containsChat(i?.subItems));
  }

  /** Entrée du menu qui ouvre la messagerie (pour y afficher le compteur de messages non lus). */
  isChatItem(item: any): boolean {
    return (item?.label || '').toLowerCase() === 'chat' || (item?.link || '').toLowerCase() === '/chat';
  }

  ngOnInit(): void {
    // Menu Items
    console.log("this.token.getUser().roles[0].name",this.token.getUser())
    this.sideBar.getMenu(this.token.getUser().roles[0].id).subscribe(data=>{
      // la bulle de chat dépend de l'autorisation « Chat » du profil (page Autorisations par profil)
      this.chatNotifications.setAllowed(this.containsChat(data));
      // le chat s'ouvre par la bulle flottante : pas d'entrée dans le menu latéral
      this.menuItems = data.filter((item: any) => !this.isChatItem(item));
      this.menuItems.forEach((menuItem: any) => {
        console.log("menuItem",menuItem)

      })
      console.log("data",this.menuItems)

    })

    this.router.events.subscribe((event) => {
      if (document.documentElement.getAttribute('data-layout') != "twocolumn") {
        if (event instanceof NavigationEnd) {
          this.initActiveMenu();
        }
      }
    });
  }

  /***
   * Activate droup down set
   */
  ngAfterViewInit() {
    setTimeout(() => {
      this.initActiveMenu();
    }, 0);
  }

  removeActivation(items: any) {
    items.forEach((item: any) => {
      item.classList.remove("active");
    });
  }

  toggleItem(item: any) {
    this.menuItems.forEach((menuItem: any) => {
       if (menuItem == item) {
        menuItem.collapsed = !menuItem.collapsed
      } else {
        menuItem.collapsed = true
      }
      if (menuItem.subItems) {
        menuItem.subItems.forEach((subItem: any) => {

          if (subItem == item) {
            menuItem.collapsed = !menuItem.collapsed
            subItem.collapsed = !subItem.collapsed
          } else {
            subItem.collapsed = true
          }
          if (subItem.subItems) {
            subItem.subItems.forEach((childitem: any) => {

              if (childitem == item) {
                childitem.collapsed = !childitem.collapsed
                subItem.collapsed = !subItem.collapsed
                menuItem.collapsed = !menuItem.collapsed
              } else {
                childitem.collapsed = true
              }
              if (childitem.subItems) {
                childitem.subItems.forEach((childrenitem: any) => {

                  if (childrenitem == item) {
                    childrenitem.collapsed = false
                    childitem.collapsed = false
                    subItem.collapsed = false
                    menuItem.collapsed = false
                  } else {
                    childrenitem.collapsed = true
                  }
                })
              }
            })
          }
        })
      }
    });
  }

  activateParentDropdown(item: any) {
    item.classList.add("active");
    let parentCollapseDiv = item.closest(".collapse.menu-dropdown");

    if (parentCollapseDiv) {
      parentCollapseDiv.parentElement.children[0].classList.add("active");
      if (parentCollapseDiv.parentElement.closest(".collapse.menu-dropdown")) {
        if (parentCollapseDiv.parentElement.closest(".collapse").previousElementSibling)
          parentCollapseDiv.parentElement.closest(".collapse").previousElementSibling.classList.add("active");
        if (parentCollapseDiv.parentElement.closest(".collapse").previousElementSibling.closest(".collapse")) {
          parentCollapseDiv.parentElement.closest(".collapse").previousElementSibling.closest(".collapse").previousElementSibling.classList.add("active");
        }
      }
      return false;
    }
    return false;
  }

  updateActive(event: any) {
    const ul = document.getElementById("navbar-nav");
    if (ul) {
      const items = Array.from(ul.querySelectorAll("a.nav-link"));
      this.removeActivation(items);
    }
    this.activateParentDropdown(event.target);
  }

  initActiveMenu() {
    let pathName = window.location.pathname;
    if (environment.production) {
      pathName = pathName.replace('/velzon/angular/creative', '');
    }

    const active = this.findMenuItem(pathName, this.menuItems);

    // Only expand, don't toggle (avoid collapsing open menus)
    this.expandItem(active);

    const ul = document.getElementById("navbar-nav");
    if (ul) {
      const items = Array.from(ul.querySelectorAll("a.nav-link"));
      const activeItems = items.filter((x: any) => x.classList.contains("active"));
      this.removeActivation(activeItems);

      const matchingMenuItem = items.find((x: any) => {
        let path = x.pathname;
        if (environment.production) {
          path = path.replace('/velzon/angular/creative', '');
        }
        return path === pathName;
      });

      if (matchingMenuItem) {
        this.activateParentDropdown(matchingMenuItem);
      }
    }
  }

  expandItem(item: any): void {
    if (!item) return;
    item.collapsed = false;
    if (item.parent) {
      this.expandItem(item.parent);
    }
  }


  private findMenuItem(pathname: string, menuItems: any[]): any {
    for (const menuItem of menuItems) {
      if (menuItem.link && menuItem.link === pathname) {
        return menuItem;
      }

      if (menuItem.subItems) {
        const foundItem = this.findMenuItem(pathname, menuItem.subItems);
        if (foundItem) {
          return foundItem;
        }
      }
    }

    return null;
  }
  /**
   * Returns true or false if given menu item has child or not
   * @param item menuItem
   */
  hasItems(item: MenuItem) {
     return item.subItems !== null ? item.subItems.length > 0 : false;
  }

  /**
   * Toggle the menu bar when having mobile screen
   */
  toggleMobileMenu(event: any) {
    var sidebarsize = document.documentElement.getAttribute("data-sidebar-size");
    if (sidebarsize == 'sm-hover-active') {
      document.documentElement.setAttribute("data-sidebar-size", 'sm-hover');

    } else {
      document.documentElement.setAttribute("data-sidebar-size", 'sm-hover-active')
    }
  }

  /**
   * SidebarHide modal
   * @param content modal content
   */
  SidebarHide() {
    document.body.classList.remove('vertical-sidebar-enable');
  }
}

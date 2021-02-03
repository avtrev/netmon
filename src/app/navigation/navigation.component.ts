import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.css'],
  inputs: []
})
export class NavigationComponent implements OnInit {
  @Input() name: String;
  constructor() { }

  ngOnInit(): void {
  }

}

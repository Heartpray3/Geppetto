import { Component, OnDestroy, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RobotCommunicationService } from '@app/services/robot-communication/robot-communication.service';
import { Subscription } from 'rxjs';
import { NotificationService } from '@app/services/notification/notification.service';
import { StartMissionPopupComponent } from '@app/components/start-mission-popup/start-mission-popup.component';

@Component({
    selector: 'app-control-panel',
    standalone: true,
    templateUrl: './control-panel.component.html',
    styleUrls: ['./control-panel.component.scss'],
    imports: [CommonModule, StartMissionPopupComponent],
})
export class ControlPanelComponent implements OnInit, OnDestroy {
    private subscriptions: Subscription[] = [];
    private socketConnected: boolean = false;
    showPopup: boolean = false;

    constructor(
        private robotService: RobotCommunicationService,
        private notificationService: NotificationService,
    ) {}

    ngOnInit(): void {
        this.subscriptions.push(
            this.robotService.onMissionStatus().subscribe((message) => {
                this.notificationService.sendNotification(message);
            }),
            this.robotService.onRobotIdentification().subscribe((message) => {
                this.notificationService.sendNotification(message);
            }),
            this.robotService.onCommandError().subscribe((message) => {
                this.notificationService.sendNotification(`Error: ${message}`);
            }),

            this.robotService.onConnectionStatus().subscribe((isConnected) => {
                if (isConnected) console.log('WebSocket is connected');
                else console.log('WebSocket is disconnected');
                this.socketConnected = isConnected;
            }),
        );
        window.addEventListener('keydown', this.handleKeyDown.bind(this));
    }

    @HostListener('window:keydown', ['$event'])
    handleKeyDown(event: KeyboardEvent) {
        if (event.key === 'Escape') {
            this.showPopup = false;
        }
    }

    verifySocketConnection() {
        if (this.socketConnected) return true;
        else this.notificationService.sendNotification('No socket connection has been established');
        return false;
    }

    startMission() {
        if (this.verifySocketConnection()) {
            this.showPopup = true;
        }
    }

    onMissionStart() {
        this.showPopup = false;
        this.robotService.startMission();
    }

    onCancel() {
        this.showPopup = false;
    }

    stopMission() {
        if (this.verifySocketConnection()) {
            try {
                this.robotService.endMission();
            } catch (error) {
                console.error('Error stopping mission', error);
            }
        }
    }

    returnHome() {
        if (this.verifySocketConnection()) {
            try {
                this.robotService.returnToBase();
            } catch (error) {
                console.error('Error identifying robot', error);
            }
        }
    }

    updateSoftware() {
        if (this.verifySocketConnection()) {
            try {
                this.robotService.updateControllerCode('new code here');
            } catch (error) {
                console.error('Error identifying robot', error);
            }
        }
    }

    ngOnDestroy(): void {
        this.subscriptions.forEach((sub) => sub.unsubscribe());
    }
}

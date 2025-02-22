sdk-dev:
	cd sdk-node && npm run dev

server-dev:
	cd server && npm run dev

dev:
	make sdk-dev & make server-dev



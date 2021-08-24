# Gold Claim & The Graph

git clone

## Localhost Commands
> First delete the generated and build folders from the subgraph folder. Also delete the data folder from the services directory.

cd services, cd graph-node

docker-compose up

In new terminal:

cd subgraph

yarn codegen

yarn build

yarn create-local

yarn deploy-local

> Once you deploy-local, the docker terminal should start scanning the specified blockchain looking for events. You can set the starting block in the .yaml file. 

## Production Commands

yarn codegen

yarn build

yarn graph init --studio <<subgraph-name>>
  
yarn graph auth --studio <deploy-key>
  
yarn graph deploy --studio <subgraph-name>

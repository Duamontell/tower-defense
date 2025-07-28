<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250721100850 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE player_in_room (slot SMALLINT NOT NULL, is_ready TINYINT(1) NOT NULL, id INT AUTO_INCREMENT NOT NULL, room_id INT NOT NULL, player_id INT NOT NULL, INDEX IDX_39D091BA54177093 (room_id), INDEX IDX_39D091BA99E6F5DF (player_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE room (code VARCHAR(10) NOT NULL, status SMALLINT NOT NULL, created_at DATETIME NOT NULL, id INT AUTO_INCREMENT NOT NULL, UNIQUE INDEX code_idx (code), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('ALTER TABLE player_in_room ADD CONSTRAINT FK_39D091BA54177093 FOREIGN KEY (room_id) REFERENCES room (id)');
        $this->addSql('ALTER TABLE player_in_room ADD CONSTRAINT FK_39D091BA99E6F5DF FOREIGN KEY (player_id) REFERENCES user (id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE player_in_room DROP FOREIGN KEY FK_39D091BA54177093');
        $this->addSql('ALTER TABLE player_in_room DROP FOREIGN KEY FK_39D091BA99E6F5DF');
        $this->addSql('DROP TABLE player_in_room');
        $this->addSql('DROP TABLE room');
    }
}

<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250721104221 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE player_in_room DROP FOREIGN KEY FK_39D091BA54177093');
        $this->addSql('ALTER TABLE player_in_room ADD CONSTRAINT FK_39D091BA54177093 FOREIGN KEY (room_id) REFERENCES room (id) ON DELETE CASCADE');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE player_in_room DROP FOREIGN KEY FK_39D091BA54177093');
        $this->addSql('ALTER TABLE player_in_room ADD CONSTRAINT FK_39D091BA54177093 FOREIGN KEY (room_id) REFERENCES room (id) ON UPDATE NO ACTION ON DELETE NO ACTION');
    }
}
